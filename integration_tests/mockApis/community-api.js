const { stubFor } = require('./wiremock')

module.exports = {
  stubPing: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/community/health/ping',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 'UP' },
      },
    })
  },
}
