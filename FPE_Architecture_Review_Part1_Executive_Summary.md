# FPE Architecture Review and Microservices Migration Analysis
## Part 1: Executive Summary and Current Architecture Review

**Document Version:** 1.0  
**Date:** February 2025  
**Prepared For:** FPE Architecture Review  
**Prepared By:** Architecture Team

---

## Executive Summary

This document provides a comprehensive review of the existing FPE (Field Performance Engineering) architecture, analyzes the rationale for moving to a microservices architecture, evaluates pros and cons, assesses impact on existing solutions and clients, estimates work effort and timelines, identifies key decision factors, and outlines the future state architecture.

### Key Findings

1. **Current State**: FPE is built on ASP.NET Core with ABP Framework, using a monolithic architecture with background services for scheduled jobs
2. **Primary Components**: 
   - Web applications (Host, Public, Mobile)
   - Background job schedulers (CalculatorScheduler, BackgroundJobScheduler, AzureServiceBusScheduler)
   - Core business logic modules
   - Entity Framework Core data access layer
3. **Existing Microservices Analysis**: Previous analysis exists for CalculatorScheduler microservices split (5 services proposed)
4. **Technology Stack**: .NET 8.0, ABP Framework 9.0, Azure services, SQL Server

### Recommendations Overview

- **Short-term**: Optimize current monolithic architecture, address performance issues
- **Medium-term**: Consider selective microservices migration for high-impact, isolated components
- **Long-term**: Full microservices migration if scalability and team autonomy requirements justify the investment

---

## Current Architecture Review

### 1. System Overview

The FPE system is a comprehensive benefit plan calculation and management platform built on:

- **Framework**: ASP.NET Core with ABP Framework 9.0
- **Architecture Pattern**: Layered Monolithic Architecture
- **Database**: SQL Server with Entity Framework Core
- **Deployment**: Azure App Services, Azure Functions, Azure Service Bus
- **Mobile**: Xamarin-based mobile applications (iOS and Android)

### 2. Solution Structure

```
FPE Solution Structure:
├── SEB.FPE.Web.Host (Main API/Web Application)
├── SEB.FPE.Web.Public (Public-facing Web Application)
├── SEB.FPE.Web.Core (Shared Web Components)
├── SEB.FPE.Core (Domain Logic & Business Rules)
├── SEB.FPE.Application (Application Services)
├── SEB.FPE.EntityFrameworkCore (Data Access Layer)
├── SEB.FPE.DAL (Dapper-based Data Access)
├── CalculatorSchedulerService (Background Service)
├── BackgroundJobScheduler (Background Service)
├── AzureServiceBusScheduler (Azure Function)
├── SEB.FPE.Mobile.* (Mobile Applications)
└── Supporting Libraries (Telemetry, RateLimiting, GraphQL)
```

### 3. Key Architectural Components

#### 3.1 Web Applications

**SEB.FPE.Web.Host**
- Main API application
- RESTful API endpoints
- Authentication and authorization
- Multi-tenant support
- GraphQL endpoint

**SEB.FPE.Web.Public**
- Public-facing web application
- Customer portal
- Self-service features

**SEB.FPE.Web.Core**
- Shared web components
- Common controllers
- Shared filters and middleware

#### 3.2 Background Services

**CalculatorSchedulerService**
- **Purpose**: Orchestrates calculator cycles for benefit plan calculations
- **Execution Model**: BackgroundService (one-time execution per run)
- **Key Responsibilities**:
  - Schedule discovery (Pending/Current schedules)
  - Step orchestration (11 calculation steps)
  - Status management
  - Next schedule creation
- **Current Issues**: 
  - Memory problems (630MB+ Gen 2 heap growth)
  - Sequential processing limitations
  - Single point of failure
  - Performance bottlenecks with large datasets

**BackgroundJobScheduler**
- **Purpose**: Manages general background job execution
- **Execution Model**: BackgroundService
- **Key Responsibilities**:
  - Job queue management
  - Job execution coordination
  - Tenant-based job scheduling

**AzureServiceBusScheduler**
- **Purpose**: Azure Function-based scheduler
- **Execution Model**: Azure Function (triggered)
- **Key Responsibilities**:
  - Service Bus message processing
  - Event-driven job execution

#### 3.3 Core Business Logic

**SEB.FPE.Core**
- Domain services
- Business rules
- Calculator step implementations
- Custom filters (e.g., DecryptInputParametersActionFilter)
- Security components

**SEB.FPE.Application**
- Application services
- DTOs and mappings
- Use case implementations
- API contracts

#### 3.4 Data Access

**SEB.FPE.EntityFrameworkCore**
- Entity Framework Core implementation
- Database context management
- Migrations

**SEB.FPE.DAL**
- Dapper-based data access
- CQRS pattern implementation
- Stored procedure execution
- High-performance data operations

### 4. Current Architecture Patterns

#### 4.1 Layered Architecture
- **Presentation Layer**: Web applications, Mobile apps
- **Application Layer**: Application services, DTOs
- **Domain Layer**: Business logic, domain models
- **Infrastructure Layer**: Data access, external services

#### 4.2 Multi-Tenancy
- Tenant isolation at database level
- Tenant-specific configuration
- Tenant-aware data access

#### 4.3 Background Processing
- Background services for scheduled jobs
- Azure Functions for event-driven processing
- Service Bus for asynchronous messaging

### 5. Current Pain Points

#### 5.1 Scalability Issues
- **Monolithic Deployment**: Entire system must scale together
- **Resource Contention**: All components compete for same resources
- **Limited Horizontal Scaling**: Cannot scale individual components independently
- **Performance Bottlenecks**: Long-running calculations block other operations

#### 5.2 Maintainability Challenges
- **Tight Coupling**: Components are tightly coupled
- **Deployment Coupling**: Changes require redeploying entire system
- **Testing Complexity**: Difficult to test components in isolation
- **Code Complexity**: Large codebase with mixed concerns

#### 5.3 Operational Issues
- **Single Point of Failure**: System-wide failures
- **Deployment Risk**: High risk deployments affect entire system
- **Monitoring Complexity**: Mixed metrics across components
- **Resource Optimization**: Cannot optimize resources per component

#### 5.4 Performance Issues (from PERFORMANCE_OPTIMIZATION_SUMMARY.md)
- **Memory Problems**: 
  - Gen 2 Heap Growth: 630MB+
  - Large Object Heap: 11MB+
  - Working Set: 950MB+
  - Memory leaks from collections not properly disposed
- **Processing Limitations**:
  - Sequential processing (single-threaded)
  - N+1 query problems
  - Large data loading into memory
  - No memory management

### 6. Existing Microservices Analysis

Based on existing documentation (`CalculatorScheduler_Microservices_Split_Documentation.md`), there is already a detailed analysis for splitting CalculatorScheduler into 5 microservices:

1. **Schedule Discovery & Orchestration Service**
2. **Calculation Execution Service**
3. **Reporting & Generation Service**
4. **Schedule Lifecycle Management Service**
5. **Notification & Monitoring Service**

**Key Findings from Existing Analysis:**
- Proposed architecture uses Azure Service Bus for inter-service communication
- WebJobs-based architecture considered for handling large workloads (300MB+)
- Batching strategy for parallel processing
- Horizontal scaling through Continuous WebJobs

### 7. Technology Stack Summary

**Backend:**
- .NET 8.0
- ABP Framework 9.0
- Entity Framework Core
- Dapper (for high-performance queries)

**Frontend:**
- ASP.NET Core MVC
- Angular (likely in Web.Public)
- Xamarin (Mobile)

**Infrastructure:**
- Azure App Services
- Azure Functions
- Azure Service Bus
- Azure SQL Database
- Azure Blob Storage
- Azure Key Vault

**Supporting:**
- GraphQL
- Telemetry services
- Rate limiting
- Authentication/Authorization

---

## Next Sections

This document continues in the following parts:
- **Part 2**: Rationale, Pros and Cons of Microservices Migration
- **Part 3**: Impact Analysis on Existing Solutions and Clients
- **Part 4**: Work Effort and Timeline Estimates
- **Part 5**: Key Decision Factors and Lead Times
- **Part 6**: Future State Architecture Report

---

**End of Part 1**
