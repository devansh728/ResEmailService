 const BaseProvider = require('./baseProvider');

class MockProviderB extends BaseProvider {
  constructor() {
    super('MockProviderB', 0.3, 3); // 30% failure rate, 3 req/min limit
  }

  async send(email) {
    if (!this.circuitBreaker.isAvailable()) {
      return {
        success: false,
        message: 'Circuit breaker is open',
        provider: this.name
      };
    }

    this.resetRateLimitIfNeeded();
    if (this.requestsInMinute >= this.rateLimit) {
      return {
        success: false,
        message: 'Rate limit exceeded',
        provider: this.name
      };
    }

    this.requestsInMinute++;
    await this.simulateNetworkDelay(150, 200);

    if (Math.random() < this.failureRate) {
      this.circuitBreaker.recordFailure();
      return {
        success: false,
        message: 'Failed to send email: Rate limit exceeded',
        provider: this.name
      };
    }

    this.circuitBreaker.recordSuccess();
    return {
      success: true,
      message: 'Email sent successfully',
      provider: this.name,
      emailId: email.id
    };
  }
}

module.exports = MockProviderB;
