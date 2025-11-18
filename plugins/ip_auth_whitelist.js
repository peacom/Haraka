const ipaddr = require("ipaddr.js");

exports.register = function () {
  this.load_config();
};

exports.load_config = function () {
  this.ip_whitelist_cfg = this.config.get("ip_auth_whitelist.ini", "ini", () => {
    this.load_config();
  });
};

exports.hook_connect = function (next, connection) {
  const remote_ip = connection.remote.ip;
  const { isCheckWhitelist } = this.ip_whitelist_cfg.general;
  const hosts = this.ip_whitelist_cfg.hosts.hosts || [];

  if (["127.0.0.1", "::1"].includes(remote_ip)) return next();
  if (isCheckWhitelist !== "true" || !hosts.length) return next();
  if (ipAllowed(remote_ip, hosts, this)) return next();

  return next(DENY, `Your IP: ${remote_ip} is not allowed to send email`);
};

function ipAllowed(remote_ip, hosts, plugin) {
  try {
    const addr = ipaddr.parse(remote_ip);
    return hosts.some((ip) => {
      if (ip.includes("/")) {
        const [range, bits] = ip.split("/");
        const rangeAddr = ipaddr.parse(range);
        return addr.match(rangeAddr, parseInt(bits, 10));
      } else {
        return remote_ip === ip;
      }
    });
  } catch (e) {
    plugin.logerror(e);
    return false;
  }
}
