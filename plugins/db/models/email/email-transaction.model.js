const { DataTypes, Model } = require('sequelize')

const EMAIL_STATUS = { PENDING: 1, SENT: 2, FAIL: 3, BOUNCE: 4, DELIVERED: 5, OPEN: 6, CLICK: 7, SPAM: 8 }

const RECIPIENT_TYPE = {
  TO: 1,
  CC: 2,
  BCC: 3,
}
class EmailTransaction extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        publicId: { type: DataTypes.STRING(64) },
        from: { type: DataTypes.STRING(100) },
        to: { type: DataTypes.STRING(100) },
        recipientType: { type: DataTypes.TINYINT },
        port: { type: DataTypes.INTEGER },
        clientIP: { type: DataTypes.TEXT },
        emailAccountId: { type: DataTypes.INTEGER },
        tls: { type: DataTypes.TINYINT },
        status: { type: DataTypes.TINYINT },
        createdDate: { type: DataTypes.DATE },
        lastUpdated: { type: DataTypes.DATE },
        extraData: { type: DataTypes.TEXT },
      },
      { sequelize, tableName: 'email_transaction', modelName: 'emailTransaction', timestamps: false, ...opts },
    )
  }

  static associate(models) {
    this.hasOne(models.EmailPartner, {
      foreignKey: 'emailTxnId',
      sourceKey: 'id',
      as: 'emailPartner',
    })
  }
}

module.exports = { EmailTransaction, EMAIL_STATUS, RECIPIENT_TYPE }
