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

  server.get('/', (req, res) => {
    if (!req.cookies.token) {
      res.cookie('token', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyOTZLNUIiLCJhdWQiOiIyMkNMVlkiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJhY3QgcnNldCBybG9jIHJ3ZWkgcmhyIHJwcm8gcm51dCByc2xlIiwiZXhwIjoxNTE4ODE4MjQ4LCJpYXQiOjE1MTgyMTM0NDh9.gr2swOjOHParnfX9bADxQoNY3Y5hRqyzZtiUy4XpKa8')
      console.log('cookie created')
    }
    return app.render(req, res, req.route.path, req.query)
  })

  server.get('/callback', (req, res) => console.log(req))

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('Server ready on http://localhost:3000!')
  })
})
