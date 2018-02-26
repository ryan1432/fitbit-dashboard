import fetch from 'isomorphic-unfetch'
import qs from 'query-string'
import jwtDecode from 'jwt-decode'

async function verifyTokenExpiration (req, token) {
  return new Promise(async (resolve, reject) => {
    if (!token || token === 'undefined') resolve(new Error('missing token'))

    const payload = jwtDecode(token)
    if (!token || !payload) resolve(new Error('invalid token'))

    const { exp } = payload
    // see if the token is expired (or wiill expire within the hour)
    if (exp < (Date.now() / 1000) - (60 * 60)) {
      console.log('requesting new token')
      const credentials = await fetch(`${process.env.APP_URL}api/authorize/refresh`, {
        credentials: 'include',
        headers: {
          Cookie: `refresh_token=${req.cookies.refresh_token}`,
        },
      })
      const body = await credentials.json()
      console.log('got new credentials', body)
      // console.log('saving token to localStorage')
      // global.window.localStorage.setItem('access_token', credentials.access_token)
      resolve({ payload: body.access_token, refreshed: true })
    }
    resolve({ payload: token })
  })
}

export function queue () {

}

export const test = async (url, { req, params, requireAuth = true, ...opts }) => {
  let query = ''
  if (params) {
    query = `?${qs.stringify(params)}`
  }
  let token
  let refreshed
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
    const { payload, refreshed: _refreshed } = await verifyTokenExpiration(req, token)
    refreshed = _refreshed
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
  responseBody.refreshed = refreshed
  return responseBody
}

class RequestHelper {
  async onError ({ url, response, options }) {
    // something bad happened, lets prep an error
    const error = new Error(response.statusText)
    const refreshToken = options.req
      ? options.req.cookies.refresh_token
      : global.window.localStorage.getItem('refresh_token')

    switch (response.status) {
      case 401: {
        console.log('refreshToken', refreshToken)
        const credentials = await fetch(`${process.env.APP_URL}api/authorize/refresh`, {
          credentials: 'include',
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        })
        const body = await credentials.json()
        options.req.cookies.access_token = body.access_token
        options.req.cookies.refresh_token = body.refresh_token
        return this.request(url, options)
      }
      default: {
        throw error
      }
    }
  }

  getConfig (url, { params, req, requireAuth = true, ...opts }) {
    let query = ''
    if (params) {
      query = `?${qs.stringify(params)}`
    }
    const finalUrl = `${process.env.APP_URL}api${url}${query}`
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
      if (token) opts.headers.authorization = `Bearer ${token}`
    }
    return {
      url: finalUrl,
      options: opts,
    }
  }

  async request (url, options = {}) {
    const { url: URL, options: OPTIONS } = this.getConfig(url, options)
    let response = await fetch(URL, OPTIONS)
    if (!response.ok) {
      response = await this.onError({ url, response, options })
      return response
    }
    const responseBody = await response.json()
      .catch(() => response.text())
      .catch(() => null)

    return responseBody
  }
}

export default new RequestHelper()
