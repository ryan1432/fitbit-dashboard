const moment = require('moment-immutable')

const getClientToken = () => {
  return Buffer.from(`${process.env.FITBIT_OAUTH_CLIENT_ID}:${process.env.FITBIT_APP_SECRET}`).toString('base64')
}

const storeCredentials = (response, body) => {
  response.cookie('access_token', body.access_token)
  response.cookie('refresh_token', body.refresh_token)
  response.cookie('expires', moment().add(body.expires_in, 'seconds'))
  return body
}

// const checkToken = (req, res) => {
//   return new Promise((resolve, reject) => {
//     console.log('in checkToken')
//     /* eslint-disable camelcase */
//     const { access_token, refresh_token } = req.cookies
//     const { exp } = jwtDecode(access_token)
//     console.log('>>>>', exp)
//     if (exp * 1000 < Date.now() - (60 * 60 * 1000)) {
//       // token will expire within the hour. Lets get a new one.
//       return request.get({
//         url: `${process.env.APP_URL}api/authorize/refresh`,
//         json: true,
//         headers: {
//           Cookie: `access_token=${access_token}; refresh_token=${refresh_token}`,
//         },
//       }, (err, response) => {
//         if (err) throw new Error(err)
//         storeCredentials(res, response.body)
//         resolve(response.body)
//       })
//     }
//     resolve(false)
//     /* eslint-enable camelcase */
//   })
// }

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
