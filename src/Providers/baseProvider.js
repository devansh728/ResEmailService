const  CircuitBreaker = require('../core/circuitbreaker');
const { EmailProvider } = require('../core/interfaces');

class BaseProvider extends EmailProvider {
  constructor(name, failureRate, rateLimit) {
    super();
    this.name = name;
    this.failureRate = failureRate;
    this.rateLimit = rateLimit;
    this.requestsInMinute = 0;
    this.lastResetTime = Date.now();
    this.circuitBreaker = new CircuitBreaker();
  }

  resetRateLimitIfNeeded() {
    const now = Date.now();
    if (now - this.lastResetTime > 60000) {
      this.requestsInMinute = 0;
      this.lastResetTime = now;
    }
  }

  async simulateNetworkDelay(minDelay, maxDelay) {
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

module.exports = BaseProvider;