 const BaseProvider = require('./baseProvider');

class MockProviderA extends BaseProvider {
  constructor() {
    super('MockProviderA', 0.2, 5); // 20% failure rate, 5 req/min limit
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
    await this.simulateNetworkDelay(100, 150);

    if (Math.random() < this.failureRate) {
      this.circuitBreaker.recordFailure();
      return {
        success: false,
        message: 'Failed to send email: Service unavailable',
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

module.exports = MockProviderA;
