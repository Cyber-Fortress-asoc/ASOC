# ASOC System Architecture

## 1. High-Level Architecture

```text
                    ASOC PLATFORM
                          │
             ┌────────────┴────────────┐
             │                         │
        NEXT.JS FRONTEND          EXPRESS BACKEND
             │                         │
             │              ┌──────────┼──────────┐
             │              │          │          │
             │           REST API   Detection   Alerting
             │              │        Engine        │
             │              │          │           │
             │              └──────────┼───────────┘
             │                         │
             │                      MongoDB
             │
             └──────── API / WebSocket ─────────┘
```

## 2. Frontend

The frontend is responsible for the analyst-facing interface.

It will eventually contain:

- Dashboard
- Alerts
- Events
- Incidents
- Investigation interface
- Threat intelligence information
- Response actions
- User management
- Analytics

Technology:

- Next.js
- TypeScript
- Tailwind CSS

## 3. Backend

The backend provides the APIs and core security-processing logic.

Responsibilities include:

- Authentication
- Authorization
- Event ingestion
- Event processing
- Detection rules
- Alert generation
- Incident management
- Threat intelligence
- Response management
- Audit logging

Technology:

- Node.js
- Express.js
- TypeScript

## 4. Database

MongoDB will store application and security data.

Expected collections include:

- Users
- Events
- Alerts
- Incidents
- Detection Rules
- Threat Intelligence
- Responses
- Audit Logs

## 5. Event Flow

The expected security-event flow is:

```text
Security Event
      │
      ▼
Log Ingestion
      │
      ▼
Parsing
      │
      ▼
Normalization
      │
      ▼
Event Storage
      │
      ▼
Detection Engine
      │
      ▼
Suspicious?
   /       \
 NO         YES
 │           │
Store       Alert
             │
             ▼
        Analyst Review
             │
             ▼
          Response
```

## 6. Future Components

The architecture may later include:

- Socket.IO for real-time updates
- Redis for caching and queues
- Threat intelligence APIs
- Automated response mechanisms
- Docker containers
- Cloud deployment
- AI-assisted security analysis

These components will be introduced only when required by the system.

## 7. Design Principle

The project will be developed incrementally.

The initial objective is to establish a reliable flow from:

```text
Event → Detection → Alert → Investigation → Response
```

Additional functionality will be added after the core pipeline is stable.
