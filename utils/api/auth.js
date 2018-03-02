import Cookies from 'js-cookie'
import NextCookies from 'next-cookies'

const KEYS = {
  access_token: 'access_token',
  refresh_token: 'refresh_token',
}

class AuthHelper {
  set (obj = {}, opts = { path: '/' }) {
    Object.keys(obj).forEach(key => {
      if (Object.keys(KEYS).indexOf(key) > -1) {
        Cookies.set(key, obj[key], opts)
      }
      return obj
    })
  }

  getAccessToken (ctx) {
    return NextCookies(ctx)[KEYS.access_token]
  }

  getRefreshToken (ctx) {
    return NextCookies(ctx)[KEYS.refresh_token]
  }

  get (ctx) {
    return NextCookies(ctx)
  }
}

export default new AuthHelper()
