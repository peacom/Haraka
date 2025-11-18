const { EmailAccount } = require("./email-account.model");
const { EmailTransaction } = require("./email-transaction.model");

function initEmailModel(sequelize) {
  return { EmailTransaction: EmailTransaction.initModel(sequelize), EmailAccount: EmailAccount.initModel(sequelize) };
}

module.exports = { initEmailModel };
