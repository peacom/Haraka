const { htmlEncode, sendTelegramMessage, errorToTraceText } = require('@peacom/core')

exports.register = function () {
  this.load_config()
}

/**
 * Reload config
 * https://github.com/haraka/haraka-config
 */
exports.load_config = function () {
  const cfg = this.config.get('system_config.ini', 'ini', () => {
    this.load_config()
  })

  /**
   * Sharing State
   * https://github.com/haraka/Haraka/blob/master/docs/Plugins.md
   */
  try {
    server.notes.sendTelegramErrorMessage = async (error, debugMessage = '') => {
      const { ENDPOINT } = cfg.main
      const { MONITORING_TELEGRAM_BOT_TOKEN, MONITORING_TELEGRAM_GROUP_ID } = cfg.telegram
      try {
        const message = [`<a href="${ENDPOINT || ''}>">${ENDPOINT || ''}</a>`]
        if (debugMessage) {
          message.push(`<strong>${debugMessage}</strong>`)
        }
        message.push(errorToTraceText(error, false))
        return await sendTelegramMessage(MONITORING_TELEGRAM_BOT_TOKEN, {
          chat_id: MONITORING_TELEGRAM_GROUP_ID,
          text: `${message.join('\n')}${message.length ? '\n' : ''}<code>${htmlEncode(error.stack)}</code>`,
          parse_mode: 'HTML',
        })
      } catch (e) {
        console.error(e)
      }
      return null
    }
    this.loginfo('Telegram Alert initialized')
  } catch (err) {
    throw new Error(err)
  }
}
