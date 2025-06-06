/**
 * Interface for email sending providers
 * @interface
 */
class EmailProvider {
  async send(email) {
    throw new Error('Method not implemented');
  }
}

/**
 * @typedef {Object} Email
 * @property {string} id - Unique identifier for idempotency
 * @property {string} to
 * @property {string} from
 * @property {string} subject
 * @property {string} body
 * @property {string} [html]
 */

/**
 * @typedef {Object} EmailResult
 * @property {boolean} success
 * @property {string} [message]
 * @property {string} [provider]
 * @property {string} [emailId]
 */

/**
 * @typedef {Object} AttemptStatus
 * @property {string} emailId
 * @property {string} provider
 * @property {Date} timestamp
 * @property {boolean} success
 * @property {string} [error]
 * @property {number} attemptNumber
 */

module.exports = {
  EmailProvider
};