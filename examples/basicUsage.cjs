/* eslint-disable no-console */
const { EmailService, MockProviderA, MockProviderB } = require('../src/index.js');

// Helper function for pretty printing
function printResults(result, history) {
  console.log('\n=== Email Service Results ===');
  console.log(`Final Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`Provider Used: ${result.provider}`);
  console.log(`Message: ${result.message}\n`);

  console.log('=== Attempt History ===');
  console.table(history.map((attempt, i) => ({
    '#': i + 1,
    Timestamp: attempt.timestamp.toISOString(),
    Provider: attempt.provider,
    Attempt: attempt.attemptNumber,
    Status: attempt.success ? '✅ Success' : '❌ Failed',
    'Error Message': attempt.error || 'N/A',
    'Backoff Used': attempt.attemptNumber > 1 ? 
      `${1000 * Math.pow(2, attempt.attemptNumber - 2)}ms` : 'None'
  })));
}

async function demonstrateEmailService() {
  try {
    // 1. Initialize service with different configurations
    const emailService = new EmailService([
      new MockProviderA(), // 20% failure rate
      new MockProviderB()  // 30% failure rate
    ], {
      maxRetries: 3,       // Max retries per provider
      initialBackoff: 1000 // Initial 1s backoff (exponential)
    });

    console.log('=== Email Service Initialized ===');
    console.log('Providers:', emailService.providers.map(p => p.name));
    console.log('Configuration:', {
      maxRetries: emailService.maxRetries,
      initialBackoff: emailService.initialBackoff
    });

    // 2. Create test email with unique ID
    const emailId = `demo-email-${Date.now()}`;
    const testEmail = {
      id: emailId,
      to: 'recipient@example.com',
      from: 'sender@example.com',
      subject: 'Resilient Email Service Demo',
      body: 'This demonstrates the resilient email service features.',
      html: '<p>This demonstrates the <strong>resilient</strong> email service features.</p>'
    };

    console.log('\n=== Sending Email ===');
    console.log('Email ID:', emailId);

    // 3. Send the email (with automatic retries and failover)
    const result = await emailService.send(testEmail);
    const history = emailService.getAttemptHistory(emailId);

    // 4. Display comprehensive results
    printResults(result, history);

    // 5. Demonstrate idempotency
    console.log('\n=== Testing Idempotency ===');
    const duplicateResult = await emailService.send(testEmail);
    console.log(`Duplicate send result: ${duplicateResult.message}`);

  } catch (error) {
    console.error('\n❌ Critical Error:', error.message);
    if (error.constructor.name !== 'Error') {
      console.error('Full Error:', error);
    }
    process.exit(1);
  }
}

// Run the demonstration
(async () => {
  await demonstrateEmailService();
  console.log('\nDemo completed successfully!');
})();