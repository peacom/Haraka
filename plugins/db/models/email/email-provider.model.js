const { DataTypes, Model } = require("sequelize");

class EmailProvider extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        emailTxnId: { type: DataTypes.INTEGER, primaryKey: true },
        providerEmailTxnId: { type: DataTypes.STRING(64) },
        host: { type: DataTypes.STRING(255) },
        createdDate: { type: DataTypes.DATE }
      },
      { tableName: "email_provider", modelName: "emailProvider", timestamps: false, sequelize, ...opts }
    );
  }

  static associate(_models) {}
}

module.exports = { EmailProvider };
