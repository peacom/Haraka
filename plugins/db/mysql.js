const { initDatabase } = require("./models");

exports.register = function () {
  this.load_config();
};

/**
 * Reload config
 * https://github.com/haraka/haraka-config
 */
exports.load_config = function () {
  const mysql_cfg = this.config.get("mysql.ini", "ini", () => {
    this.load_config();
  });

  /**
   * Sharing State
   * https://github.com/haraka/Haraka/blob/master/docs/Plugins.md
   */
  try {
    server.notes.db = initDatabase(mysql_cfg.general);
    this.loginfo("MySQL connection initialized");
  } catch (err) {
    throw new Error(err);
  }
};
