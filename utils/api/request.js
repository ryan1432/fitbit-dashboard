import fetch from 'isomorphic-unfetch'
import qs from 'query-string'

export default async (url, { req, params, requireAuth = true, ...opts }) => {
  let query = ''
  if (params) {
    query = `?${qs.stringify(params)}`
  }
  let token
  opts.headers = opts.headers || {}
  if (requireAuth) {
    if (req) token = req.cookies.token
    else if (global.window) token = global.window.localStorage.getItem('token')

    if (token) opts.headers.authorization = `Bearer ${token}`
    else return new Error('No token provided')
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
