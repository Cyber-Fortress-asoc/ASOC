# ASOC Modules

The ASOC platform is divided into independent modules. Each module has a specific responsibility and can be developed separately.

## 1. Authentication & Authorization

Responsible for:

- User registration
- Login
- JWT authentication
- Role-based access control
- Protected routes

Initial roles:

- Admin
- Analyst
- Viewer

## 2. Log Ingestion

Responsible for receiving security events from different sources.

Examples:

- Authentication logs
- Application logs
- Network events
- System events

## 3. Event Management

Responsible for:

- Parsing events
- Normalizing event formats
- Validating events
- Storing events
- Searching and filtering events

## 4. Detection Engine

Responsible for identifying suspicious activity.

Examples:

- Brute-force login attempts
- Repeated failed authentication
- Suspicious IP activity
- Unusual access patterns

The detection engine will use configurable security rules.

## 5. Alert Management

Responsible for:

- Creating alerts
- Assigning severity
- Tracking alert status
- Assigning alerts to analysts
- Closing or escalating alerts

Initial severity levels:

- Low
- Medium
- High
- Critical

## 6. Incident Management

Responsible for grouping and investigating related alerts.

An incident may contain:

- Multiple alerts
- Related events
- Affected users
- Source IPs
- Investigation notes
- Response actions

## 7. Threat Intelligence

Responsible for enriching security information.

Potential information includes:

- IP reputation
- Domain reputation
- Hash reputation
- Geographic information
- Known indicators of compromise

## 8. Response Engine

Responsible for recording or executing security responses.

Initial responses may be simulated.

Examples:

- Block IP
- Disable account
- Isolate endpoint
- Mark indicator as malicious

## 9. Analyst Dashboard

Provides a centralized interface for security analysts.

It will display:

- Security alerts
- Event statistics
- Incident status
- Severity distribution
- Recent activity
- Real-time notifications

## 10. Audit Logging

Tracks important actions performed within the ASOC.

Examples:

- User login
- Alert assignment
- Alert status change
- Incident modification
- Response execution
- Administrative actions

## Module Development Principle

Modules should communicate through clearly defined APIs and services.

A module should avoid directly modifying another module's internal data or logic.

New modules may be added as the project scope develops.
