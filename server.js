const next = require('next')
const express = require('express')
const cookieParser = require('cookie-parser')

const app = next({ dev: process.env.NODE_ENV !== 'production' })

const routes = require('./server/api/routes')
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  server.use(cookieParser())
  server.use('/api', routes)

  server.get('/', (req, res) => app.render(req, res, req.route.path, req.query))

  server.get('/callback', (req, res) => app.render(req, res, req.route.path, req.query))

  server.get('*', (req, res) => handle(req, res))

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('Server ready on http://localhost:3000!')
  })
})
