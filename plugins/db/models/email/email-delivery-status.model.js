const { DataTypes, Model } = require('sequelize')

class EmailDeliveryStatus extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        emailTxnId: { type: DataTypes.INTEGER, primaryKey: true },
        status: { type: DataTypes.TINYINT, primaryKey: true },
        statusMessage: { type: DataTypes.TEXT },
        extraData: { type: DataTypes.TEXT },
        updatedDate: { type: DataTypes.DATE },
        lastUpdated: { type: DataTypes.DATE },
      },
      { tableName: 'email_delivery_status', modelName: 'emailDeliveryStatus', timestamps: false, sequelize, ...opts },
    )
  }

  static associate(_models) {}
}

module.exports = { EmailDeliveryStatus }
