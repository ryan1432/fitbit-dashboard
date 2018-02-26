const request = require('request')
const express = require('express')
const router = express.Router()

const helpers = require('../helpers')

const FITBIT_API_URL = 'https://api.fitbit.com/1'

let activities = {
  value: [],
}

function getNextPage ({ url, headers, res, req }) {
  console.log('Getting next page of activities')

  request.get({
    url,
    headers,
    json: true,
  }, (err, { statusCode, body }) => {
    if (err || statusCode < 200 || statusCode >= 300) {
      console.log(err, body)
      res.status(statusCode).json(body)
    }
    activities.value = activities.value.concat(body.activities)
    if (body.pagination.next) {
      getNextPage({ url: body.pagination.next, headers, res, req })
    } else {
      res.json(activities.value.filter(activity => helpers.filterToRange(req.query.beforeDate, activity)))
    }
  })
}

router.get('/activity', async (req, res) => {
  console.log('Getting user activities')

  if (!req.headers.authorization) {
    // @TODO: ERROR HANDLING
    return res.json([])
  }

  let authorization = req.headers.authorization

  const headers = {
    Authorization: authorization,
    'Accept-Language': 'en_US',
  }

  request.get({
    url: `${FITBIT_API_URL}/user/-/activities/list.json`,
    headers,
    json: true,
    qs: {
      offset: 0,
      limit: 20,
      sort: 'desc',
      afterDate: req.query.afterDate,
    },
  }, (err, { statusCode, body }) => {
    if (err || statusCode < 200 || statusCode >= 300) {
      console.log('error getting activities', body)
      return res.status(statusCode).json(body)
    }
    activities.value = body.activities
    if (body.pagination.next) {
      getNextPage({ url: body.pagination.next, headers, res, req })
    } else {
      res.json(activities.value.filter(activity => helpers.filterToRange(req.query.beforeDate, activity)))
    }
  })
})

router.get('/profile', async (req, res) => {
  console.log('Getting user profile')

  if (!req.headers.authorization) {
    // @TODO: ERROR HANDLING
    return res.json({})
  }

  let authorization = req.headers.authorization

  const headers = {
    Authorization: authorization,
    'Accept-Language': 'en_US',
  }

  request.get({
    url: `${FITBIT_API_URL}/user/-/profile.json`,
    headers,
    json: true,
  }, (err, { statusCode, body }) => {
    if (err || statusCode < 200 || statusCode >= 300) {
      console.log('error getting profile', body)
      return res.status(statusCode).json(body)
    }
    res.json(body.user)
  })
})

router.get('/authorize', (req, res, next) => {
  console.log('Authorizing the user')

  request.post({
    url: 'https://api.fitbit.com/oauth2/token',
    json: true,
    headers: {
      authorization: `Basic ${helpers.getClientToken()}`,
    },
    form: {
      code: req.query.code,
      redirect_uri: `${process.env.APP_URL}${process.env.FITBIT_CALLBACK_ENDPOINT}`,
      grant_type: 'authorization_code',
    },
  }, (err, { statusCode, body }) => {
    if (err || (statusCode < 200 || statusCode >= 300)) {
      console.log(err, body)
      return res.status(statusCode).json(body)
    }
    res.json(helpers.storeCredentials(res, body))
  })
})

router.get('/authorize/refresh', (req, res) => {
  console.log('Refreshing the token')
  request.post({
    url: 'https://api.fitbit.com/oauth2/token',
    json: true,
    headers: {
      authorization: `Basic ${helpers.getClientToken()}`,
    },
    form: {
      refresh_token: req.cookies.refresh_token,
      grant_type: 'refresh_token',
    },
  }, (err, { statusCode, body }) => {
    if (err || (statusCode < 200 || statusCode >= 300)) {
      console.log('error refreshing token', body)
      return res.status(statusCode).json(body)
    }
    
    res.json(helpers.storeCredentials(res, body))
  })
})

router.get('/authorize/logout', (req, res) => {
  console.log('Logging out')
  request.post({
    url: 'https://api.fitbit.com/oauth2/revoke',
    json: true,
    headers: {
      authorization: `Basic ${helpers.getClientToken()}`,
    },
    form: {
      token: req.cookies.access_token,
    },
  }, (err, { statusCode, body }) => {
    if (err || (statusCode < 200 || statusCode >= 300)) {
      console.log('error revoking token', body)
      return res.status(statusCode).json(body)
    }
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.json({ success: true })
  })
})

module.exports = router
