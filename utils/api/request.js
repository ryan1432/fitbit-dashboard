import fetch from 'isomorphic-unfetch'
import qs from 'query-string'
import jwtDecode from 'jwt-decode'

async function verifyTokenExpiration (token) {
  return new Promise(async (resolve, reject) => {
    if (!token || token === 'undefined') resolve(new Error('missing token'))

    const payload = jwtDecode(token)
    if (!token || !payload) resolve(new Error('invalid token'))

    const { exp } = token

    // see if the token is expired (or wiill expire within the hour)
    if (exp * 1000 < Date.now() - (60 * 60 * 1000)) {
      console.log('requesting new token')
      const credentials = await fetch(`${process.env.APP_URL}api/authorize/refresh`, {
        credentials: 'include',
      })
      console.log('got new credentials')
      console.log('saving token to localStorage')
      global.window.localStorage.setItem('access_token', credentials.access_token)
      resolve({ payload: credentials })
    }
    resolve({ payload: token })
  })
}

export default async (url, { req, params, requireAuth = true, ...opts }) => {
  let query = ''
  if (params) {
    query = `?${qs.stringify(params)}`
  }
  let token
  opts.headers = opts.headers || {}
  opts.credentials = 'include'
  if (requireAuth) {
    if (req) {
      token = req.cookies.access_token
      opts.headers.Cookie = `access_token=${req.cookies.access_token}; refresh_token=${req.cookies.refresh_token}`
    } else if (global.window) {
      token = global.window.localStorage.getItem('access_token')
    }
    console.log('verifying token...')
    const { payload } = await verifyTokenExpiration(token)
    if (payload) {
      token = payload
    }

    if (token) opts.headers.authorization = `Bearer ${token}`
  }

  const response = await fetch(`${process.env.APP_URL}api${url}${query}`, opts)
  const responseBody = await response.json()
    .catch(() => response.text())
    .catch(() => null)

  if (!response.ok) {
    // something bad happend, lets throw an error
    const error = new Error(response.statusText)
    error.response = response
    error.body = responseBody

    return error
  }

  return responseBody
}
