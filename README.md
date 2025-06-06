# Email Service

A resilient, idempotent, and extensible email sending service for Node.js, implementing SOLID principles. Features include circuit breakers, retries with exponential backoff, provider failover, rate limiting, and a processing queue.

## Features

- **Multiple Providers**: Easily add or swap email providers.
- **Circuit Breaker**: Prevents repeated calls to failing providers.
- **Rate Limiting**: Each provider enforces its own request limits.
- **Retry with Exponential Backoff**: Retries failed sends with increasing delay.
- **Provider Failover**: Automatically switches to backup providers on repeated failure.
- **Idempotency**: Prevents duplicate email sends.
- **Queueing**: Handles concurrent send requests in order.
- **SOLID Principles**: Codebase is modular, extensible, and testable.

## Project Structure

```
resEmailSender/
├── package.json
├── src/
│   ├── index.js
│   ├── core/
│   │   ├── circuitBreaker.js
│   │   └── interfaces.js
│   ├── Providers/
│   │   ├── baseProvider.js
│   │   ├── index.js
│   │   ├── mockProviderA.js
│   │   └── mockProviderB.js
│   ├── services/
│   │   └── emailService.js
│   └── utils/
│       ├── idempotency.js
│       ├── logger.js
│       └── validator.js
├── examples/
│   └── basicUsage.cjs
├── testNew/
│   └── emailService.edge.test.js
└── .gitignore
```

## Getting Started

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

### Run Tests
```powershell
npm test
# or to run only edge case tests
npx jest testNew/emailService.edge.test.js
```

## Usage

See `examples/basicUsage.cjs` for a usage example. Basic pattern:

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

## SOLID Principles Applied
- **Single Responsibility**: Each class (provider, service, utility) has one responsibility.
- **Open/Closed**: Add new providers by extending `BaseProvider` without modifying existing code.
- **Liskov Substitution**: All providers implement the same interface and can be swapped.
- **Interface Segregation**: Provider interface is minimal and focused.
- **Dependency Inversion**: `EmailService` depends on abstractions (provider interface), not concrete implementations.

## Extending
- Add new providers by extending `BaseProvider` and implementing the `send` method.
- Plug new providers into `EmailService` via its constructor.

## Testing
- Edge cases (provider switching, circuit breaker, queue, retries, idempotency) are covered in `testNew/emailService.edge.test.js`.

## License
MIT
