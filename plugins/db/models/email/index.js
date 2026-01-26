const { EmailAccount } = require("./email-account.model");
const { EmailTransaction } = require("./email-transaction.model");
const { EmailProvider } = require("./email-provider.model");

function initEmailModel(sequelize) {
  return {
    EmailTransaction: EmailTransaction.init(sequelize),
    EmailAccount: EmailAccount.init(sequelize),
    EmailProvider: EmailProvider.init(sequelize)
  };
}

module.exports = { initEmailModel };
