const { DataTypes, Model } = require("sequelize");

class EmailSummaryDaily extends Model {
  static init(sequelize, opts) {
    return super.init(
      {
        emailAccountId: { type: DataTypes.INTEGER, allowNull: false },
        summaryDate: { type: DataTypes.DATE, allowNull: false },
        timezoneId: { type: DataTypes.INTEGER, allowNull: false },
        pending: { type: DataTypes.INTEGER },
        success: { type: DataTypes.INTEGER },
        fail: { type: DataTypes.INTEGER },
        bounce: { type: DataTypes.INTEGER },
        lastUpdated: { type: DataTypes.DATE },
        fromTime: { type: DataTypes.DATE },
        toTime: { type: DataTypes.DATE }
      },
      { tableName: "email_summary_daily", modelName: "emailSummaryDaily", timestamps: false, sequelize, ...opts }
    );
  }
}

module.exports = { EmailSummaryDaily };
