const { EmailAccount } = require("./email-account.model");
const { EmailTransaction } = require("./email-transaction.model");

function initEmailModel(sequelize) {
  return { EmailTransaction: EmailTransaction.init(sequelize), EmailAccount: EmailAccount.init(sequelize) };
}

module.exports = { initEmailModel };
