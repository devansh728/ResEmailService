class EmailValidator {
  static validate(email) {
    if (!email) throw new Error('Email is required');
    if (!email.id) throw new Error('Email ID is required for idempotency');
    if (!email.to || !email.from || !email.subject || !email.body) {
      throw new Error('Email must have to, from, subject, and body fields');
    }
    if (!this.isValidEmail(email.to) || !this.isValidEmail(email.from)) {
      throw new Error('Invalid email address format');
    }
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

module.exports = EmailValidator; 
