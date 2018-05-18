module.exports = {
  dev: {
    env: require('./dev.env'),
    port: 9000,
    autoOpenBrowser: true,
  },
  prod: {
    env: require('./prod.env'),
    port: 3000,
    autoOpenBrowser: false,
  },
}