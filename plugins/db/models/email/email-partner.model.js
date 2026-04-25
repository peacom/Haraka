const { DataTypes, Model } = require('sequelize')

class EmailPartner extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        emailTxnId: { type: DataTypes.INTEGER, primaryKey: true },
        partnerTxnId: { type: DataTypes.STRING(64) },
      },
      { tableName: 'email_partner', modelName: 'emailPartner', timestamps: false, sequelize, ...opts },
    )
  }

  static associate(_models) {}
}

module.exports = { EmailPartner }
