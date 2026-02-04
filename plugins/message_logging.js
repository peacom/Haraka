const { EMAIL_STATUS } = require("./db/models/email/email-transaction.model");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { emailLog } = require("./logging/winston");
const { decodeMimeWord } = require("mimelib");

/**
 * https://haraka.github.io/core/Plugins/
 * Register a Hook
 */
exports.register = function () {
  this.loginfo("message-logging plugin loaded");
  this.register_hook("deny", "error_handle");
  this.register_hook("bounce", "bounce_handle");

  if (!server.notes.eventBus) {
    const EventEmitter = require("events");
    server.notes.eventBus = new EventEmitter();
  }

  server.notes.eventBus.on("smtp_forward_success", this.forward_success.bind(this));
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
    const from = formatAddress(txn?.mail_from.address());
    const recipients = txn?.rcpt_to.map((r) => formatAddress(r.address()));
    const headers = txn?.header;
    const body = txn?.body;
    // Get Email Subject and convert MIME string to UTF-8
    const subject = decodeMimeWord(headers.get("subject")?.trim());
    if (!harakaId) return next();

    // Auth validate
    const accountRequest = connection.notes.auth_user;
    if (!accountRequest) throw new Error(`Invalid Auth`);
    const account = await EmailAccount.findOne({ where: { username: accountRequest } });
    if (!account) throw new Error(`Not found any account by username: ${accountRequest}`);
    this.accountRequest = accountRequest;
    emailLog.info(`Account Request: ${accountRequest}`);
    emailLog.info(`Haraka ID: ${harakaId}`);
    emailLog.info(`Have email from ${from} to ${JSON.stringify(recipients)}`);
    emailLog.info(`Subject: ${subject}`);
    emailLog.info(`---------------------------------------------------------------------------------`);

    // const attachments = [];
    // for (const part of body.children) {
    //   if (part.attachment_stream) {
    //     const filename = part.disposition_params?.filename || `file-${Date.now()}`;
    //     const savePath = path.join(__dirname, "../mail-attachments");
    //     if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });
    //     const filePath = path.resolve(savePath, filename);
    //     const writeStream = fs.createWriteStream(filePath);
    //     // TODO saving attachment
    //     // part.attachment_stream.pipe(writeStream, { end: true });
    //     // attachments.push({ filename: part.disposition_params?.filename, mime: part.ctype, size: part.body?.length || 0 });
    //   }
    // }

    // Create mail request
    for (const recipient of recipients) {
      await EmailTransaction.create({
        harakaId,
        emailAccountId: account.id,
        clientIP: connection.remote.ip,
        port: connection.local.port,
        tls: connection.tls.enabled,
        from,
        to: recipient,
        subject,
        content: body.bodytext?.trim(),
        isHtml: body.is_html,
        status: EMAIL_STATUS.PENDING,
        createdDate: new Date()
      });
    }
    next();
  } catch (err) {
    return next(DENYSOFT, err);
  }
};

exports.forward_success = async function (payload) {
  const { EmailProvider } = server.notes.db;
  const { harakaId, response, providerHost, recipients } = payload;
  const messageId = response[0].split(" ").at(-1);
  const recipientAddresses = recipients.map((rcp) => formatAddress(rcp.original));
  emailLog.info(`forward_success: Email Provider Txn ID - ${messageId}`);
  emailLog.info(`Haraka ID: ${harakaId}`);
  emailLog.info(`Provider Host: ${providerHost}`);
  emailLog.info(`Recipients: ${JSON.stringify(recipientAddresses)}`);
  emailLog.info(`---------------------------------------------------------------------------------`);

  for (const address of recipientAddresses) {
    await EmailProvider.upsert({
      emailTransactionId: harakaId,
      providerEmailTransactionId: messageId,
      recipient: address,
      host: providerHost,
      lastUpdated: new Date()
    });
  }

  updateMessageStatus(harakaId, EMAIL_STATUS.SUCCESS, "Delivered").catch((err) =>
    server.notes.sendTelegramErrorMessage(err, `${this.accountRequest} - message_logging`).then()
  );
};

exports.bounce_handle = async function (next, hook_data) {
  const { EmailTransaction } = server.notes.db;
  const { uuid: harakaId, mail_from, rcpt_to } = hook_data.todo;
  const statusMessage = rcpt_to[0].dsn_smtp_response;
  const recipient = formatAddress(rcpt_to[0].original);

  emailLog.error(`bounce_handle: Haraka ID - ${harakaId}`);
  emailLog.error(`From: ${mail_from}`);
  emailLog.error(`Recipient: ${recipient}`);
  emailLog.error(`Bounce Message: ${JSON.stringify(statusMessage)}`);
  emailLog.error(`---------------------------------------------------------------------------------`);

  EmailTransaction.update(
    { status: EMAIL_STATUS.BOUNCE, statusMessage: rcpt_to[0].dsn_smtp_response, lastUpdated: new Date() },
    { where: { harakaId, to: recipient } }
  ).catch((err) => server.notes.sendTelegramErrorMessage(err, `${this.accountRequest} - message_logging`).then());
  next();
};

exports.error_handle = async function (next, connection, params) {
  const txn = connection.transaction;
  const harakaId = txn?.uuid;

  try {
    const { EmailTransaction } = server.notes.db;
    if (!harakaId) return next();
    emailLog.error(`error_handle: Haraka ID - ${harakaId}`);
    const transactions = await EmailTransaction.count({ where: { harakaId } });

    if (!transactions) {
      this.logerror(`Not found any transaction by id ${harakaId}`);
      emailLog.error(`Error Message: Not found any transaction by id ${harakaId}`);
      emailLog.error(`---------------------------------------------------------------------------------`);
      return next();
    }
    const errorMessage = JSON.stringify(params);
    emailLog.error(`Error Message: ${errorMessage}`);
    emailLog.error(`---------------------------------------------------------------------------------`);

    await updateMessageStatus(harakaId, EMAIL_STATUS.FAIL, errorMessage);
    server.notes.sendTelegramErrorMessage(new Error(errorMessage), `${this.accountRequest} - message_logging`).then();
    next();
  } catch (err) {
    this.logerror(err);
    server.notes.sendTelegramErrorMessage(err, `${this.accountRequest} - message_logging`).then();
    next();
  }
};

async function updateMessageStatus(harakaId, statusCode, statusMessage) {
  const { EmailTransaction } = server.notes.db;
  await EmailTransaction.update(
    { status: statusCode, statusMessage, lastUpdated: new Date() },
    { where: { harakaId, status: { [Op.ne]: EMAIL_STATUS.BOUNCE } } }
  );
}

function formatAddress(address) {
  if (typeof address !== "string") return "";
  return address.replace(/[<>]/g, "").toLowerCase();
}
