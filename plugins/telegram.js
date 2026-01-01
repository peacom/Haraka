const { htmlEncode, sendTelegramMessage, errorToTraceText } = require("@peacom/core");

exports.register = function () {
  this.load_config();
};

/**
 * Reload config
 * https://github.com/haraka/haraka-config
 */
exports.load_config = function () {
  const telegram_cfg = this.config.get("telegram.ini", "ini", () => {
    this.load_config();
  });

  /**
   * Sharing State
   * https://github.com/haraka/Haraka/blob/master/docs/Plugins.md
   */
  try {
    server.notes.sendTelegramErrorMessage = async (error, debugMessage = "") => {
      const env = telegram_cfg.main;
      try {
        const message = [`<a href="${env.WEB_URL || ""}>">${env.WEB_URL || ""}</a>`];
        if (debugMessage) {
          message.push(`<strong>${debugMessage}</strong>`);
        }
        message.push(errorToTraceText(error, false));
        return await sendTelegramMessage(env.MONITORING_TELEGRAM_BOT_TOKEN, {
          chat_id: env.MONITORING_TELEGRAM_GROUP_ID,
          text: `${message.join("\n")}${message.length ? "\n" : ""}<code>${htmlEncode(error.stack)}</code>`,
          parse_mode: "HTML"
        });
      } catch (e) {
        console.error(e);
      }
      return null;
    };
    this.loginfo("Telegram Alert initialized");
  } catch (err) {
    throw new Error(err);
  }
};
