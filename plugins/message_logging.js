const { EMAIL_STATUS } = require("./db/models/email/email-transaction.model");

exports.register = function () {
  this.loginfo("message-logging plugin loaded");
  this.register_hook("deny", "error_handle");
};

exports.hook_data = function (next, connection) {
  // enable mail body parsing
  connection.transaction.parse_body = true;
  next();
};

exports.hook_data_post = async function (next, connection) {
  try {
    const { EmailAccount, EmailTransaction } = server.notes.db;
    const txn = connection.transaction;
    const harakaId = txn?.uuid;
    const rcpt_to = txn?.rcpt_to;
    const headers = txn?.header;
    const body = txn?.body;

    if (!harakaId) return next();

    // Auth validate
    const accountRequest = connection.notes.auth_user;
    if (!accountRequest) throw new Error(`Invalid Auth`);
    const account = await EmailAccount.findOne({ where: { username: accountRequest } });
    if (!account) throw new Error(`Not found any account by username: ${accountRequest}`);
    this.accountRequest = accountRequest;

    // Create mail request
    const recipients = rcpt_to.map((r) => r.address());
    for (const recipient of recipients) {
      await EmailTransaction.create({
        harakaId,
        emailAccountId: account.id,
        clientIP: connection.remote.ip,
        port: connection.local.port,
        tls: connection.tls.enabled,
        from: txn?.mail_from.address(),
        to: recipient,
        subject: headers.get("subject"),
        content: body.bodytext,
        status: EMAIL_STATUS.PENDING,
        createdDate: new Date()
      });
    }
    next();
  } catch (err) {
    return next(DENYSOFT, err);
  }
};

exports.error_handle = async function (next, connection, params) {
  try {
    const { EmailTransaction } = server.notes.db;
    const harakaId = connection.transaction?.uuid;
    if (!harakaId) return next();
    const transactions = await EmailTransaction.count({ where: { harakaId } });
    if (!transactions) {
      this.logerror(`Not found any transaction by id ${harakaId}`);
      return next();
    }
    const errorMessage = JSON.stringify(params);
    await updateMessageStatus(harakaId, EMAIL_STATUS.FAIL, errorMessage);
    server.notes.sendTelegramErrorMessage(new Error(errorMessage), `${this.accountRequest} - Message Logging Plugin`).then();
    next();
  } catch (err) {
    this.logerror(err);
    server.notes.sendTelegramErrorMessage(err, `${this.accountRequest} - Message Logging Plugin`).then();
    next();
  }
};

async function updateMessageStatus(harakaId, statusCode, statusMessage) {
  const { EmailTransaction } = server.notes.db;
  await EmailTransaction.update({ status: statusCode, statusMessage }, { where: { harakaId } });
}
