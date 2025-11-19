const { EMAIL_STATUS } = require('./db/models/email/email-transaction.model')

exports.register = function () {
  this.loginfo('message-logging plugin loaded')
  this.register_hook('rcpt', 'request_message')
  this.register_hook('rcpt_ok', 'save_message_to_db')
  this.register_hook('deny', 'error_handle')
}

exports.request_message = async function (next, connection, params) {
  try {
    const { EmailAccount, EmailTransaction } = server.notes.db
    const accountRequest = connection.notes.auth_user
    const account = await EmailAccount.findOne({ where: { username: accountRequest } })
    if (!account) throw new Error(`Not found any account by username: ${accountRequest}`)

    await EmailTransaction.create({
      harakaId: connection.transaction.uuid,
      userId: account.id,
      clientIP: connection.remote.ip,
      port: connection.local.port,
      tls: connection.tls.enabled,
      from: connection.transaction.mail_from.address(),
      to: connection.transaction.rcpt_to.map((r) => r.address()).join(','),
      extraData: JSON.stringify({
        subject: connection.transaction.header.get('Subject') || '',
      }),
      status: EMAIL_STATUS.PENDING,
      createdDate: new Date(),
    })

    next()
  } catch (err) {
    return next(DENYSOFT, err)
  }
}

exports.save_message_to_db = async function (next, connection, params) {
  try {
    const { EmailTransaction } = server.notes.db
    const harakaId = connection.transaction.uuid
    const transaction = await EmailTransaction.findOne({ where: { harakaId } })
    if (!transaction) throw new Error(`Not found any transaction by id ${harakaId}`)

    transaction.status = EMAIL_STATUS.SUCCESS
    transaction.statusMessage = 'Success'
    await transaction.save()

    next(OK)
  } catch (err) {
    return next(DENYSOFT, err)
  }
}

exports.error_handle = async function (next, connection, params) {
  try {
    const { EmailTransaction } = server.notes.db
    const harakaId = connection.transaction.uuid
    const transaction = await EmailTransaction.findOne({ where: { harakaId } })
    if (!transaction) throw new Error(`Not found any transaction by id ${harakaId}`)

    transaction.status = EMAIL_STATUS.FAIL
    transaction.statusMessage = JSON.stringify(params)
    await transaction.save()
    next()
  } catch (err) {
    return next(DENY, err)
  }
}
