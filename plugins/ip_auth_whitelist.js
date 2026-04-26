const ipaddr = require('ipaddr.js')

exports.register = function () {
  this.load_config()
}

exports.load_config = function () {
  this.cfg = this.config.get('system_config.ini', 'ini', () => {
    this.load_config()
  })
}

exports.hook_connect = function (next, connection) {
  const remote_ip = connection.remote.ip
  const { isCheckWhitelist, ips = [] } = this.cfg.ip_whitelist

  if (['127.0.0.1', '::1'].includes(remote_ip)) return next()
  if (isCheckWhitelist !== 'true' || !ips.length) return next()
  if (ipAllowed(remote_ip, ips, this)) return next()

  return next(DENYDISCONNECT, `Your IP: ${remote_ip} is not allowed to send email`)
}

function ipAllowed(remote_ip, hosts, plugin) {
  try {
    const addr = ipaddr.parse(remote_ip)
    return hosts.some((ip) => {
      if (ip.includes('/')) {
        const [range, bits] = ip.split('/')
        const rangeAddr = ipaddr.parse(range)
        return addr.match(rangeAddr, parseInt(bits, 10))
      } else {
        return remote_ip === ip
      }
    })
  } catch (e) {
    plugin.logerror(e)
    return false
  }
}
