// Auth against a flat file

exports.register = function () {
  this.inherits("auth/auth_base");
  this.load_flat_ini();

  if (this.cfg.core.constrain_sender) {
    this.register_hook("mail", "constrain_sender");
  }
};

exports.load_flat_ini = async function () {
  this.cfg = this.config.get("auth_flat_file.ini", { booleans: ["+core.constrain_sender", "+core.use_on_db"] }, () => {
    this.load_flat_ini();
  });

  if (this.cfg.users === undefined) this.cfg.users = {};
};

exports.hook_capabilities = function (next, connection) {
  // if (!connection.remote.is_private && !connection.tls.enabled) {
  //     connection.logdebug(this, "Auth disabled for insecure public connection");
  //     return next();
  // }

  const methods = this.cfg.core?.methods ? this.cfg.core.methods.split(",") : null;
  if (methods && methods.length > 0) {
    connection.capabilities.push(`AUTH ${methods.join(" ")}`);
    connection.notes.allowed_auth_methods = methods;
  }
  next();
};

exports.get_plain_passwd = async function (user, connection, cb) {
  if (user && this.cfg.core.use_on_db) {
    const { EmailAccount } = server.notes.db;
    const account = await EmailAccount.findOne({ where: { username: user }, attributes: ["password"], raw: true });
    if (account) return cb(account.password);
  } else if (this.cfg.users[user]) return cb(this.cfg.users[user].toString());

  cb();
};
