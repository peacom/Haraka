const { EmailAccount } = require('./email-account.model')
const { EmailTransaction } = require('./email-transaction.model')
const { EmailPartner } = require('./email-partner.model')
const { EmailDeliveryStatus } = require('./email-delivery-status.model')

function initEmailModel(sequelize) {
  return {
    EmailTransaction: EmailTransaction.init(sequelize),
    EmailAccount: EmailAccount.init(sequelize),
    EmailPartner: EmailPartner.init(sequelize),
    EmailDeliveryStatus: EmailDeliveryStatus.init(sequelize),
  }
}

module.exports = { initEmailModel }
