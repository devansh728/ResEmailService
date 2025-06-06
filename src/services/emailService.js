const Logger = require('../utils/logger');
const IdempotencyTracker = require('../utils/idempotency');
const EmailValidator = require('../utils/validator');

class EmailService {
  constructor(providers, options = {}) {
    if (!providers || providers.length === 0) {
      throw new Error('At least one email provider must be specified');
    }

    this.providers = providers;
    this.maxRetries = options.maxRetries || 3;
    this.initialBackoff = options.initialBackoff || 1000;
    this.currentProviderIndex = 0;
    this.idempotencyTracker = new IdempotencyTracker();
    this.attemptHistory = [];
    this.queue = [];
    this.isProcessing = false;
  }

  async send(email) {
    EmailValidator.validate(email);

    if (this.idempotencyTracker.checkAndTrack(email.id)) {
      const previousAttempt = this.attemptHistory.find(a => a.emailId === email.id && a.success);
      if (previousAttempt) {
        return {
          success: true,
          message: 'Email was already sent successfully',
          provider: previousAttempt.provider,
          emailId: email.id
        };
      }
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ email, resolve, reject });
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const { email, resolve, reject } = this.queue.shift();

    try {
      const result = await this.sendWithRetry(email);
      resolve(result);
    } catch (error) {
      reject(error);
    }

    setImmediate(() => this.processQueue());
  }

  async sendWithRetry(email, attempt = 0, providerIndex = this.currentProviderIndex) {
    const provider = this.providers[providerIndex];
    const attemptNumber = attempt + 1;

    try {
      const result = await provider.send(email);
      
      const status = {
        emailId: email.id,
        provider: provider.name,
        timestamp: new Date(),
        success: result.success,
        error: result.success ? undefined : result.message,
        attemptNumber
      };

      this.attemptHistory.push(status);
      Logger.logAttempt(status);

      if (result.success) {
        this.currentProviderIndex = providerIndex;
        return result;
      }

      if (attemptNumber >= this.maxRetries) {
        const nextProviderIndex = (providerIndex + 1) % this.providers.length;
        if (nextProviderIndex !== providerIndex) {
          return this.sendWithRetry(email, 0, nextProviderIndex);
        }
        throw new Error(`All providers failed after ${attemptNumber} attempts`);
      }

      const backoff = this.initialBackoff * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoff));

      return this.sendWithRetry(email, attemptNumber, providerIndex);
    } catch (error) {
      const status = {
        emailId: email.id,
        provider: provider.name,
        timestamp: new Date(),
        success: false,
        error: error.message,
        attemptNumber
      };

      this.attemptHistory.push(status);
      Logger.logAttempt(status);

      throw error;
    }
  }

  getAttemptHistory(emailId) {
    return this.attemptHistory.filter(attempt => attempt.emailId === emailId);
  }
}

module.exports = EmailService;
