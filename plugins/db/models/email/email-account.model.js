const { DataTypes, Model } = require("sequelize");

class EmailAccount extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: { type: DataTypes.STRING(100) },
        password: { type: DataTypes.STRING(256) },
        companyId: { type: DataTypes.INTEGER },
        createdById: { type: DataTypes.INTEGER },
        createdDate: { type: DataTypes.DATE }
      },
      { sequelize, tableName: "email_account", modelName: "emailAccount", timestamps: false, ...opts }
    );
  }
}

module.exports = { EmailAccount };
