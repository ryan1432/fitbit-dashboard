const moment = require('moment-immutable')

const getClientToken = () => {
  return Buffer.from(`${process.env.FITBIT_OAUTH_CLIENT_ID}:${process.env.FITBIT_APP_SECRET}`).toString('base64')
}

const storeCredentials = (response, body) => {
  response.cookie('access_token', body.access_token)
  response.cookie('refresh_token', body.refresh_token)
  return body
}

const filterToRange = (endDate, activity) => {
  if (!endDate) return true
  let activityMoment = moment(activity.startTime)
  let endDateMoment = moment(endDate, 'YYYY-MM-DD')
  return activityMoment.isSameOrBefore(endDateMoment.startOf('day').add(1, 'day'))
}

module.exports = {
  getClientToken,
  storeCredentials,
  filterToRange,
}
