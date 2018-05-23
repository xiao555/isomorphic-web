module.exports = {
  dev: {
    env: require('./dev.env'),
    port: 3000,
    autoOpenBrowser: true,
  },
  prod: {
    env: require('./prod.env'),
    port: 3000,
    autoOpenBrowser: false,
  },
  // API Gateway
  api: {
    // API URL to be used in the client-side code
    clientUrl: process.env.API_CLIENT_URL || '',
    // API URL to be used in the server-side code
    serverUrl:
      process.env.API_SERVER_URL ||
      `http://localhost:${process.env.PORT || 3000}`,
  },
}