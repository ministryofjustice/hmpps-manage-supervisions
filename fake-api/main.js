const path = require('path')
const jsonServer = require('json-server')

const app = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))

const middlewares = jsonServer.defaults({
  noCors: true,
})

const healthOk = {
  status: 'UP',
  components: {
    db: { status: 'UP' },
    ldap: { status: 'UP' },
    ping: { status: 'UP' },
  },
}

app.get('/health/ping', (req, res, next) => {
  res.status(200).json(healthOk.components.ping)
})

app.get('/health', (req, res, next) => {
  res.status(200).json(healthOk)
})

app.use(middlewares)
app.use(router)

app.listen(8082, () => {
  console.log('JSON Server is running')
})
