class CircuitBreaker {
  constructor(threshold = 5, timeout = 10000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
  }

  recordSuccess() {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
    }
  }

  isAvailable() {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN' && Date.now() - this.lastFailureTime > this.timeout) {
      this.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }
}

module.exports = CircuitBreaker;