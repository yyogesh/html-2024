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

