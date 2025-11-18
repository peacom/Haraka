const { DataTypes, Model } = require('sequelize')

const EMAIL_STATUS = { PENDING: 1, SUCCESS: 2, FAIL: 3 }

class EmailTransaction extends Model {
  static initModel(sequelize) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        harakaId: { type: DataTypes.STRING(64) },
        from: { type: DataTypes.STRING(100) },
        to: { type: DataTypes.STRING(100) },
        port: { type: DataTypes.INTEGER },
        clientIP: { type: DataTypes.TEXT },
        userId: { type: DataTypes.INTEGER },
        tls: { type: DataTypes.TINYINT },
        status: { type: DataTypes.TINYINT },
        statusMessage: { type: DataTypes.TEXT },
        createdDate: { type: DataTypes.DATE },
        extraData: { type: DataTypes.TEXT },
      },
      { sequelize, tableName: 'email_transaction', modelName: 'emailTransaction', timestamps: false },
    )
  }
}

module.exports = { EmailTransaction, EMAIL_STATUS }
