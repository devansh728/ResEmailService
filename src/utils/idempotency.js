class IdempotencyTracker {
  constructor() {
    this.sentEmails = new Set();
  }

  checkAndTrack(emailId) {
    if (this.sentEmails.has(emailId)) {
      return true;
    }
    this.sentEmails.add(emailId);
    return false;
  }
}

module.exports = IdempotencyTracker; 
