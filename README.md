# Resilient Email Sending Service

A robust, extensible, and testable email sending service in JavaScript, designed with SOLID principles. This project demonstrates advanced patterns such as retries with exponential backoff, provider failover, idempotency, rate limiting, circuit breaker, logging, and queueing—all using mock providers for demonstration and testing.

## Purpose

In microservice-based architectures or critical systems, email notifications like password resets, alerts, or updates are vital. But they can fail due to external SMTP downtime, network issues, or message processing crashes. This project solves that with a resilient, retry-capable, and fault-tolerant email service.

## Features

- **Retry Mechanism**: Retries failed email sends with exponential backoff.
- **Provider Fallback**: Automatically switches to a backup provider after repeated failures.
- **Idempotency**: Prevents duplicate email sends for the same request.
- **Rate Limiting**: Each provider enforces its own request-per-minute limit.
- **Status Tracking**: Tracks and exposes the status of each email send attempt.
- **Circuit Breaker**: Prevents repeated calls to failing providers, allowing recovery after a timeout.
- **Simple Logging**: Logs attempts and errors for observability.
- **Queue System**: Handles concurrent send requests in order, ensuring reliability under load.
- **SOLID Principles**: Modular, extensible, and testable codebase.

## Use Cases

 * Password resets

 * Alert notifications

 * Marketing or bulk email campaigns

 * System-to-system email workflows in microservices

## Project Structure

```
resEmailSender/
├── package.json
├── README.md
├── examples/
│   └── basicUsage.cjs
├── src/
│   ├── index.js
│   ├── core/
│   │   ├── circuitBreaker.js
│   │   └── interfaces.js
│   ├── Providers/
│   │   ├── baseProvider.js
│   │   ├── mockProviderA.js
│   │   └── mockProviderB.js
│   ├── services/
│   │   └── emailService.js
│   └── utils/
│       ├── idempotency.js
│       ├── logger.js
│       └── validator.js
├── testNew/
│   └── emailService.edge.test.js
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js v16 or later
- npm

### Install Dependencies
```powershell
npm install
```

### Run Example
```powershell
npm start
```

### Run All Tests
```powershell
npm test
```

### Run Only Edge Case Tests
```powershell
npx jest testNew/emailService.edge.test.js
```

## Usage Example

See `examples/basicUsage.cjs` for a full example. Basic usage:

```js
const { EmailService, MockProviderA, MockProviderB } = require('./src');

const providers = [new MockProviderA(), new MockProviderB()];
const emailService = new EmailService(providers);

const email = {
  id: 'unique-id-123',
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Hello',
  body: 'This is a test email.'
};

emailService.send(email)
  .then(result => console.log(result))
  .catch(err => console.error(err));
```

## Assumptions
- Providers are mocked and do not send real emails.
- Each email must have a unique `id` for idempotency.
- Rate limits and failure rates are configurable per provider.
- The service is designed for demonstration and extensibility, not production use.

## SOLID Principles Applied
- **Single Responsibility**: Each class (provider, service, utility) has one responsibility.
- **Open/Closed**: Add new providers by extending `BaseProvider` without modifying existing code.
- **Liskov Substitution**: All providers implement the same interface and can be swapped.
- **Interface Segregation**: Provider interface is minimal and focused.
- **Dependency Inversion**: `EmailService` depends on abstractions (provider interface), not concrete implementations.

## Testing
- Comprehensive unit and edge case tests are provided in `testNew/emailService.edge.test.js`.
- Run tests with `npm test` or target specific files with `npx jest`.

## Learning Outcomes

This project helped me strengthen my understanding of:

 * Microservice communication patterns

 * Fault-tolerant systems

 * Queue-based asynchronous processing

 * SMTP handling and observability

 * Resilient architecture principles


## License
MIT
