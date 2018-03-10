import fetch from 'isomorphic-unfetch'
import qs from 'query-string'

import AuthHelper from './auth'

class RequestHelper {
  async onError ({ url, response, options }) {
    // something bad happened, lets prep an error
    const error = new Error(response.statusText)

    switch (response.status) {
      case 401: {
        if (this.refreshInFlight) {
          // we already hit 401 once and tried a refresh. If we got another 401,
          // just stop trying and return the error
          this.refreshInFlight = false
          return { error }
        }

        const responseBody = await response.json()
          .catch(() => response.text())
          .catch(() => null)

        if (!responseBody.errors.some(e => e.errorType === 'expired_token')) return { error }

        this.refreshInFlight = true
        const refreshToken = AuthHelper.getRefreshToken({ req: options.req })
        const credentials = await fetch(`${process.env.APP_URL}api/authorize/refresh`, {
          credentials: 'include',
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        })
        this.authorization = await credentials.json()
        this.authRefreshed = true
        console.log('token refreshed')
        AuthHelper.set(this.authorization)

        options.req.cookies.access_token = this.authorization.access_token
        options.req.cookies.refresh_token = this.authorization.refresh_token

        return this.request(url, options)
      }

      default: {
        return { error }
      }
    }
  }

  getConfig (url, { params, req, requireAuth = true, ...opts }) {
    let query = ''
    if (params) query = `?${qs.stringify(params)}`

    const finalUrl = `${process.env.APP_URL}api${url}${query}`

    opts.headers = opts.headers || {}
    opts.credentials = 'include'
    if (requireAuth) {
      let token = AuthHelper.getAccessToken()
      if (this.authorization) token = this.authorization.access_token
      if (token) opts.headers.authorization = `Bearer ${token}`
    }

    return {
      url: finalUrl,
      options: opts,
    }
  }

  async request (url, options = {}) {
    console.log(`requesting ${url}`)
    const { url: URL, options: OPTIONS } = this.getConfig(url, options)
    let response = await fetch(URL, OPTIONS)
    if (!response.ok) {
      response = await this.onError({ url, response, options })
      return response
    }
    const responseBody = await response.json()
      .catch(() => response.text())
      .catch(() => null)

    let auth
    if (this.authRefreshed) {
      auth = this.authorization
    }

    return {
      body: responseBody,
      auth,
    }
  }
}

export default new RequestHelper()
