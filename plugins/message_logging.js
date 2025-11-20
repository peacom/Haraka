const { EMAIL_STATUS } = require('./db/models/email/email-transaction.model')

exports.register = function () {
  this.loginfo('message-logging plugin loaded')
  this.register_hook('rcpt', 'request_message')
  this.register_hook('rcpt_ok', 'save_message_to_db')
  this.register_hook('deny', 'error_handle')
}

exports.request_message = async function (next, connection, params) {
  try {
    const harakaId = connection.transaction?.uuid
    if (!harakaId) return next()
    const { EmailAccount, EmailTransaction } = server.notes.db
    const accountRequest = connection.notes.auth_user
    if (!accountRequest) throw new Error(`Invalid Auth`)
    const account = await EmailAccount.findOne({ where: { username: accountRequest } })
    if (!account) throw new Error(`Not found any account by username: ${accountRequest}`)
    const toAddresses = connection.transaction.rcpt_to.map((r) => r.address())
    for (const to of toAddresses) {
      await EmailTransaction.create({
        harakaId,
        userId: account.id,
        clientIP: connection.remote.ip,
        port: connection.local.port,
        tls: connection.tls.enabled,
        from: connection.transaction.mail_from.address(),
        to,
        extraData: JSON.stringify({ subject: connection.transaction.header.get('Subject') || '' }),
        status: EMAIL_STATUS.PENDING,
        createdDate: new Date(),
      })
    }
    next()
  } catch (err) {
    return next(DENYSOFT, err)
  }
}

exports.save_message_to_db = async function (next, connection, params) {
  try {
    const { EmailTransaction } = server.notes.db
    const harakaId = connection.transaction?.uuid
    if (!harakaId) return next()
    const transactions = await EmailTransaction.findAll({ where: { harakaId } })
    if (!transactions.length) {
      this.logerror(`Not found any transaction by id ${harakaId}`)
      return next()
    }
    await EmailTransaction.update({ where: { harakaId } }, { status: EMAIL_STATUS.SUCCESS, statusMessage: 'Success' })
    next(OK)
  } catch (err) {
    return next(DENYSOFT, err)
  }
}

exports.error_handle = async function (next, connection, params) {
  try {
    const { EmailTransaction } = server.notes.db
    const harakaId = connection.transaction?.uuid
    if (!harakaId) return next()
    const transactions = await EmailTransaction.findAll({ where: { harakaId } })
    if (!transactions.length) {
      this.logerror(`Not found any transaction by id ${harakaId}`)
      return next()
    }
    await EmailTransaction.update({ where: { harakaId } }, { status: EMAIL_STATUS.FAIL, statusMessage: JSON.stringify(params) })
    next()
  } catch (err) {
    this.logerror(err)
    next()
  }
}
