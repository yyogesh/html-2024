# DecryptFunction Class - Technical Documentation

## Overview

The `DecryptFunction` class is an Azure Function that handles decryption operations for encrypted files stored in blob storage. It provides three main entry points triggered by different events: backlog checks, dead letter processing, and new message processing.

---


## Azure Function Entry Points

### 1. Decrypt-CheckBacklog

**Trigger:** Timer-based (runs every 15 minutes based on CRON expression)  
**Purpose:** Processes messages that may have been missed or require retry

```csharp
[FunctionName("Decrypt-CheckBacklog")]
public async Task OnBacklogCheckTimeElapsedAsync(
    [TimerTrigger(CRON_EVERY_15_MIN)] TimerInfo myTimer
)
```

**Behavior:**
- Executes on timer trigger using SOURCE_QUEUE
- Waits for SubQueue.None
- Configured with `false` parameter (likely disables auto-complete)

---

### 2. Decrypt-RequeueDeadLetter

**Trigger:** Timer-based (runs at interval defined by DEAD_LETTER_CHECK_INTERVAL_SETTINGS_KEY)  
**Purpose:** Reprocesses messages from the dead letter queue

```csharp
[FunctionName("Decrypt-RequeueDeadLetter")]
public async Task OnDeadLetterProcessingTimeElapsedAsync(
    [TimerTrigger(DEAD_LETTER_CHECK_INTERVAL_SETTINGS_KEY)] TimerInfo timerInfo
)
```

**Behavior:**
- Requeues dead-lettered messages from SOURCE_QUEUE
- Waits with `false` configuration

---

### 3. Decrypt-NewMessage

**Trigger:** Service Bus message arrival  
**Purpose:** Main entry point for processing new decrypt requests

```csharp
[FunctionName("Decrypt-NewMessage")]
public async Task OnMessageReceivedAsync(
    [ServiceBusTrigger(SOURCE_QUEUE, Connection = SERVICE_BUS_CONNECTION_NAMESPACE_KEY, 
    AutoCompleteMessages = false)] ServiceBusReceivedMessage[] messages,
    ServiceBusMessageActions messageActions
)
```

**Parameters:**
- `messages` - Array of received Service Bus messages
- `messageActions` - Actions to perform on messages (complete, abandon, etc.)

**Behavior:**
- Processes incoming messages from the Service Bus queue
- Executes `ExecuteServiceBusMessageQueueTrigger` with message array and actions
- Waits with `false` configuration

---


## Core Processing Method

### Process

```csharp
protected override Task Process(DecryptPacket dataPacket)
```

**Purpose:** Main processing logic for decryption operations

**Validation:**
- Throws `ArgumentNullException` if `dataPacket` is null

**Workflow:**
1. Validates input packet
2. Calls `PerformDecryption` method
3. Returns the processing task

---

## Decryption Logic

### PerformDecryption

```csharp
private async Task PerformDecryption(DecryptPacket dataPacket)
```

**Purpose:** Orchestrates the complete decryption workflow

#### Step 1: Get Encrypted File Location
```csharp
var decryptFileLocation = dataPacket.ClassifiedFiles[dataPacket.DecryptClassifier].Location;
```
Retrieves the storage location of the encrypted file using the classifier.

#### Step 2: Acquire Blob Stream Awaiter
```csharp
var encryptedStreamAwaiter = _blobClient.AcquireBlobStreamAsync(decryptFileLocation);
var decryptedFileStreamAwaiter = DecryptionBlobLoadDataStart(encryptedStreamAwaiter, dataPacket);
```
- Initiates asynchronous blob stream acquisition
- Starts the decryption blob loading process in parallel

#### Step 3: Prepare Destination File Name
```csharp
var encryptedFileName = decryptFileLocation.Split('/').Last();
var decryptedFileName = Path.GetFileNameWithoutExtension(encryptedFileName);
```
- Extracts the encrypted file name from the path
- Removes extension to get original file name (handles .privacera extension removal)

#### Step 4: Get Destination URI
```csharp
var destinationUri = GetDecryptFileStorageLocation(decryptedFileName, dataPacket.Provider);
```
Constructs the destination blob storage URI based on:
- Decrypted file name
- Provider information
- Standard container structure

#### Step 5: Determine File Classification
```csharp
var decryptedFileClassification = Provider.GetContentClassifier(destinationUri.AbsoluteUri);
```
Gets the appropriate content classifier for the decrypted file.

#### Step 6: Determine Next Queue
```csharp
var nextQueue = Provider.GetDestinationQueue(GetType().Name, decryptedFileClassification.Classifier);
```
Determines which queue should receive the message after decryption completes.

#### Step 7: Complete Blob Stream Acquisition
```csharp
using var decryptedFileStream = await decryptedFileStreamAwaiter.ConfigureAwait(false);
```
Waits for the decryption process to complete and obtains the decrypted stream.

#### Step 8: Capture Metadata
```csharp
dataPacket.AddDecryptedFileClassification(decryptedFileClassification.Classifier, destinationUri.AbsoluteUri);
dataPacket.CaptureDecryptedFileSize(destinationUri.AbsoluteUri, decryptedFileStream.Length.ToHumanReadableFileSize());
```
- Records the classification of the decrypted file
- Captures the file size in human-readable format

#### Step 9: Upload to Destination
```csharp
await _blobClient.StoreFileAsync(destinationUri.AbsoluteUri, decryptedFileStream);
```
Uploads the decrypted file stream to the destination blob storage.

#### Step 10: Route to Next Queue
```csharp
await SendMessageToQueueAsync(nextQueue, $"Routed by {GetType().Name}", dataPacket).ConfigureAwait(false);
```
Sends the data packet to the next processing queue in the workflow.

---

## Helper Methods

### GetDecryptFileStorageLocation

```csharp
private Uri GetDecryptFileStorageLocation(string decryptedFileName, string provider)
```

**Purpose:** Constructs the destination blob storage URI for decrypted files

**Parameters:**
- `decryptedFileName` - Name of the decrypted file (without extension)
- `provider` - Provider identifier

**Logic:**
1. Gets the target zone from blob storage configuration (Processing zone)
2. Extracts the host from the endpoint
3. Removes protocol prefix and trailing slashes
4. Builds URI with pattern: `https://{host}/{StandardContainers.Processing}/{provider}/{decryptedFileName}`

**Returns:** `Uri` object pointing to the destination location

---

### DecryptWhenDownloaded

```csharp
private async Task<Stream> DecryptWhenDownloaded(
    Task<Stream> encryptedStreamAwaiter, 
    DecryptPacket dataPacket
)
```

**Purpose:** Performs actual decryption once the encrypted stream is available

**Parameters:**
- `encryptedStreamAwaiter` - Task that will provide the encrypted file stream
- `dataPacket` - Packet containing decryption metadata

**Workflow:**

#### Step 1: Extract Source File Name
```csharp
var sourceFileName = dataPacket.ClassifiedFiles[dataPacket.DecryptClassifier].Location.Split('/').Last();
```

#### Step 2: Unprotect (Decrypt) Stream
```csharp
var decryptedStreamAwaiter = _privaceraClient.Unprotect(await encryptedStreamAwaiter.ConfigureAwait(false), sourceFileName);
var callStartTime = DateTime.UtcNow;
```
- Calls Privacera service to decrypt the stream
- Records the start time for tracking

#### Step 3: Wait for Decryption Completion
```csharp
var decryptedFileStream = await decryptedStreamAwaiter.ConfigureAwait(false);
```

#### Step 4: Record External Service Call
```csharp
dataPacket.RecordExternalServiceCall(Const.PRIVACERA.ToUpperInvariant(), callStartTime, DateTime.UtcNow);
```
Logs the Privacera API call duration for monitoring and analytics.

**Returns:** Decrypted `Stream` object

---

