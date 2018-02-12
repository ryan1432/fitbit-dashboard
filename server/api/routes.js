const request = require('request')
const express = require('express')
const router = express.Router()
const moment = require('moment-immutable')

const FITBIT_API_URL = 'https://api.fitbit.com/1'

let activities = {
  value: [],
}

function getNextPage ({ url, headers, res, req }) {
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
      getNextPage({ url: body.pagination.next, headers, res, req })
    } else {
      res.json(activities.value.filter(activity => filterToRange(req.query.beforeDate, activity)))
    }
  })
}

function filterToRange (endDate, activity) {
  if (!endDate) return true
  let activityMoment = moment(activity.startTime)
  return activityMoment.isSameOrBefore(endDate)
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
      },
    }, (err, response) => {
      if (err || response.statusCode < 200 || response.statusCode >= 300) {
        return res.status(response.statusCode).json(response.body)
      }
      const body = JSON.parse(response.body)
      activities.value = body.activities
      if (body.pagination.next) {
        getNextPage({ url: body.pagination.next, headers, res, req })
      } else {
        res.json(activities.value.filter(activity => filterToRange(req.query.beforeDate, activity)))
      }
    })
}, (err, res, next) => {
  if (err) console.log('err!!!', err)
  next()
})

module.exports = router
