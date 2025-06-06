class Logger {
  static logAttempt(status) {
    console.log(`[Attempt] Email: ${status.emailId}, Provider: ${status.provider}, ` +
      `Attempt: ${status.attemptNumber}, Status: ${status.success ? 'SUCCESS' : 'FAILED'}`);
  }

  static error(message, error) {
    console.error(`[Error] ${message}`, error);
  }
}

module.exports = Logger; 
