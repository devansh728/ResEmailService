// Add this at the top of your test file
// Tests for EmailService covering edge cases: provider switching, circuit breaker, queueing, retries, idempotency, and processing
const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const EmailService = require('../src/services/emailService.js');
const MockProviderA = require('../src/Providers/mockProviderA.js');
const MockProviderB = require('../src/Providers/mockProviderB.js');

describe('EmailService Edge Cases', function () {
  let service, providerA, providerB;

  beforeEach(() => {
    providerA = new MockProviderA();
    providerB = new MockProviderB();
    service = new EmailService([providerA, providerB], { maxRetries: 2, initialBackoff: 10 });
  });

  it('should send email successfully with first provider', async () => {
    sinon.stub(providerA, 'send').resolves({ success: true, message: 'ok', provider: providerA.name, emailId: '1' });
    const email = { id: '1', to: 'a@b.com', from: 'b@a.com', subject: 's', body: 'b' };
    const result = await service.send(email);
    expect(result.success).to.be.true;
    expect(result.provider).to.equal('MockProviderA');
  });

  it('should switch to next provider after max retries', async () => {
    sinon.stub(providerA, 'send').resolves({ success: false, message: 'fail', provider: providerA.name });
    sinon.stub(providerB, 'send').resolves({ success: true, message: 'ok', provider: providerB.name, emailId: '2' });
    const email = { id: '2', to: 'a@b.com', from: 'b@a.com', subject: 's', body: 'b' };
    const result = await service.send(email);
    expect(result.success).to.be.true;
    expect(result.provider).to.equal('MockProviderB');
  });

  it('should respect circuit breaker and not call provider if open', async () => {
    sinon.stub(providerA.circuitBreaker, 'isAvailable').returns(false);
    sinon.stub(providerB, 'send').resolves({ success: true, message: 'ok', provider: providerB.name, emailId: '3' });
    const email = { id: '3', to: 'a@b.com', from: 'b@a.com', subject: 's', body: 'b' };
    const result = await service.send(email);
    expect(result.success).to.be.true;
    expect(result.provider).to.equal('MockProviderB');
  });

  it('should queue emails and process them in order', async () => {
    const sendA = sinon.stub(providerA, 'send');
    sendA.onCall(0).resolves({ success: true, message: 'ok', provider: providerA.name, emailId: '4' });
    sendA.onCall(1).resolves({ success: true, message: 'ok', provider: providerA.name, emailId: '5' });
    const email1 = { id: '4', to: 'a@b.com', from: 'b@a.com', subject: 's', body: 'b' };
    const email2 = { id: '5', to: 'a@b.com', from: 'b@a.com', subject: 's', body: 'b' };
    const p1 = service.send(email1);
    const p2 = service.send(email2);
    const r1 = await p1;
    const r2 = await p2;
    expect(r1.emailId).to.equal('4');
    expect(r2.emailId).to.equal('5');
  });

  it('should not resend email if idempotency is detected', async () => {
    sinon.stub(providerA, 'send').resolves({ success: true, message: 'ok', provider: providerA.name, emailId: '6' });
    const email = { id: '6', to: 'a@b.com', from: 'b@a.com', subject: 's', body: 'b' };
    await service.send(email);
    const result = await service.send(email);
    expect(result.success).to.be.true;
    expect(result.message).to.match(/already sent/i);
  });

  it('should retry with exponential backoff on failure', async function () {
    jest.setTimeout(5000);
    const sendStub = sinon.stub(providerA, 'send');
    sendStub.onCall(0).resolves({ success: false, message: 'fail', provider: providerA.name });
    sendStub.onCall(1).resolves({ success: true, message: 'ok', provider: providerA.name, emailId: '7' });
    const email = { id: '7', to: 'a@b.com', from: 'b@a.com', subject: 's', body: 'b' };
    const start = Date.now();
    const result = await service.send(email);
    const elapsed = Date.now() - start;
    expect(result.success).to.be.true;
    expect(elapsed).to.be.gte(10); // initialBackoff
  });

  afterEach(() => sinon.restore());
});
