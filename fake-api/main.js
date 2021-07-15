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

const paginated = {
  '/secure/offenders/crn/:crn/contact-summary*': '/contact-summary',
}

app.use(
  jsonServer.rewriter({
    '/secure/offenders/crn/:crn/sentence/*/appointments': '/new-appointments',
    '/secure/offenders/crn/:crn/appointments': '/appointments',
    '/secure/offenders/crn/:crn/appointments/:id': '/appointments/:id',
    '/secure/appointment-types': '/appointment-types',
    '/secure/offenders/crn/:crn/all': '/offenders-by-crn/:crn',
    '/secure/offenders/crn/:crn': '/offenders-by-crn/:crn',
    '/secure/offenders/crn/:crn/convictions': '/convictions-by-crn?id=:crn',
    '/secure/offenders/crn/:crn/convictions?activeOnly=true': '/convictions-by-crn?id=:crn',
    '/secure/teams/:teamCode/office-locations': '/team-office-locations?teamCode=:teamCode',
    '/secure/offenders/crn/:crn/convictions/:conviction/requirements*': '/conviction-requirements-by-conviction/:conviction',
    '/secure/offenders/crn/:crn/personalCircumstances': '/personal-circumstances-by-crn/:crn',
    '/secure/offenders/crn/:crn/personalContacts': '/personal-contacts',
    '/secure/offenders/crn/:crn/registrations?activeOnly=true': '/registrations/:crn',
    '/arn/risks/crn/:crn': '/rosh/:crn',
    ...paginated,
  }),
)

app.use(router)

router.render = (req, res) => {
  if (req.method === 'GET' && Object.values(paginated).some(x => req.url.startsWith(x))) {
    res.jsonp({
      content: res.locals.data,
      number: 0,
      size: res.locals.data.length || 10,
      numberOfElements: res.locals.data.length,
      totalPages: res.locals.data.length === 0 ? 0 : 1,
      totalElements: res.locals.data.length,
      first: true,
      last: false,
      empty: res.locals.data.length === 0,
    })
  } else {
    res.jsonp(res.locals.data)
  }
}

app.listen(8082, () => {
  console.log('JSON Server is running')
})
