const request = require('request')
const express = require('express')
const router = express.Router()

const FITBIT_API_URL = 'https://api.fitbit.com/1'

let activities = {
  value: [],
}

function getNextPage ({ url, headers, res }) {
  request.get({
    url,
    headers,
  }, (err, response) => {
    if (err) {
      res.send(500, err)
    }
    const body = JSON.parse(response.body)

    activities.value = activities.value.concat(body.activities)
    if (body.pagination.next) {
      getNextPage({ url: body.pagination.next, headers, res })
    } else {
      res.json(activities.value)
    }
  })
}

router.get('/activity', (req, res) => {
  const headers = {
    Authorization: req.headers.authorization,
    'Accept-Language': 'en_US',
  }
  if (!req.headers.authorization) {
    return res.json([])
  }
  request
    .get({
      url: `${FITBIT_API_URL}/user/-/activities/list.json`,
      headers,
      qs: {
        offset: 0,
        limit: 20,
        sort: 'desc',
        afterDate: req.query.afterDate,
        beforeDate: req.query.beforeDate,
      },
    }, (err, response) => {
      if (err) {
        return res.status(500).json(JSON.parse(err))
      }
      const body = JSON.parse(response.body)
      activities.value = body.activities
      if (body.pagination.next) {
        getNextPage({ url: body.pagination.next, headers, res })
      } else {
        res.json(activities.value)
      }
    })
}, (err, res, next) => {
  if (err) console.log(err)
  next()
})

module.exports = router
