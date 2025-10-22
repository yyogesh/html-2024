# DecryptFunction Class - Technical Documentation

## Overview

The `DecryptFunction` class is an Azure Function that handles decryption operations for encrypted files stored in blob storage. It provides three main entry points triggered by different events: backlog checks, dead letter processing, and new message processing.

---

## Class Information

**Namespace:** (Not visible in code snippet)  
**Inheritance:** `FunctionBase<DecryptPacket>`  
**Dependencies:**
- `IPrivaceraService` - Service for handling Privacera-based decryption operations

---

## Constants

### SOURCE_QUEUE
```csharp
private const string SOURCE_QUEUE = "sbq-decrypt";
```
Defines the source Service Bus queue name for decrypt operations.

---

## Constructor

```csharp
public DecryptFunction(
    FunctionsDependencyBag dependencies, 
    IPrivaceraService privaceraClient
) : base(dependencies)
```

**Parameters:**
- `dependencies` - Bag containing common function dependencies
- `privaceraClient` - Client service for Privacera decryption operations

**Validation:** Throws `ArgumentNullException` if `privaceraClient` is null.

---
