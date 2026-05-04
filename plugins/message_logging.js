const { EMAIL_STATUS, EMAIL_ORIGIN } = require('./db/models/email/email-transaction.model')
const fs = require('fs')
const path = require('path')
const { emailLog } = require('./logging/winston')
const { decodeMimeWord } = require('mimelib')

/**
 * https://haraka.github.io/core/Plugins/
 * Register a Hook
 */
exports.register = function () {
  this.loginfo('message-logging plugin loaded')
  this.register_hook('deny', 'error_handle')
  this.register_hook('queue_ok', 'my_queue_outbound', 10)
}

exports.my_queue_outbound = async function (next, connection, params) {
  emailLog.info(`start process my_queue_outbound`)
  const { EmailTransaction, EmailPartner, EmailAccount } = server.notes.db

  try {
    const txn = connection?.transaction
    const [partnerTxnId] = params.split(' ').slice(3)
    const from = formatAddress(txn.mail_from.address())
    const recipients = filterDuplicate(txn?.rcpt_to.map((r) => formatAddress(r.address())))

    const transactions = recipients.map((rcp) => ({
      publicId: txn.uuid,
      originId: connection.notes.userLogin.accountId,
      origin: EMAIL_ORIGIN.HARAKA,
      userId: connection.notes.userLogin.userId,
      companyId: connection.notes.userLogin.companyId,
      clientIP: connection.remote.ip,
      port: connection.local.port,
      tls: connection.tls.enabled,
      from,
      to: rcp,
      status: EMAIL_STATUS.SENT,
      createdDate: new Date(),
      emailPartner: { partnerTxnId, createdDate: new Date() },
    }))

    await EmailTransaction.bulkCreate(transactions, {
      include: [{ model: EmailPartner, as: 'emailPartner' }],
    })

    emailLog.info(`end process my_queue_outbound`)
    return next()
  } catch (err) {
    emailLog.info(err.message)
    return next()
  }
}

exports.error_handle = async function (next, connection, params) {
  emailLog.info(`start process error_handle`)
  emailLog.info(`error_handle >>>: ${params}`)
  const [statusCode] = params
  const { EmailTransaction, EmailPartner, EmailAccount } = server.notes.db

  try {
    const txn = connection?.transaction
    const from = formatAddress(txn?.mail_from.address())
    if (!from) return next()

    await EmailTransaction.create({
      publicId: txn.uuid,
      originId: connection.notes.userLogin.accountId,
      origin: EMAIL_ORIGIN.HARAKA,
      userId: connection.notes.userLogin.userId,
      companyId: connection.notes.userLogin.companyId,
      clientIP: connection.remote.ip,
      port: connection.local.port,
      tls: connection.tls.enabled,
      from,
      to: '',
      status: EMAIL_STATUS.FAIL,
      createdDate: new Date(),
      extraData: JSON.stringify(params),
    })

    emailLog.info(`end process error_handle`)
    return next()
  } catch (err) {
    emailLog.info(err.message)
    return next()
  }
}

function formatAddress(rawAddress) {
  if (typeof rawAddress !== 'string') return ''
  return rawAddress.replace(/[<>]/g, '').toLowerCase()
}

function formatSubject(rawSubject) {
  return rawSubject
    .trim()
    .split('\n')
    .map((t) => decodeMimeWord(t.trim()))
    .join('')
}

function filterDuplicate(array) {
  return [...new Set(array)]
}
