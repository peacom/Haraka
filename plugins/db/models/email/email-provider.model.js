const { DataTypes, Model } = require("sequelize");

const SENDGRID_STATUS = { processed: 1, delivered: 2, deferred: 3, bounce: 4, dropped: 5 };

class EmailProvider extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        emailTransactionId: { type: DataTypes.STRING(64), primaryKey: true },
        providerEmailTransactionId: { type: DataTypes.STRING(64) },
        host: { type: DataTypes.STRING(255) },
        providerStatus: { type: DataTypes.TINYINT },
        providerStatusMessage: { type: DataTypes.TEXT },
        extraData: { type: DataTypes.TEXT },
        lastUpdated: { type: DataTypes.DATE }
      },
      { tableName: "email_provider", modelName: "emailProvider", timestamps: false, sequelize, ...opts }
    );
  }

  static associate(_models) {}
}

module.exports = { EmailProvider, SENDGRID_STATUS };
