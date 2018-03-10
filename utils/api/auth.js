import Cookies from 'js-cookie'

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
    return Cookies.get(KEYS.access_token)
  }

  getRefreshToken (ctx) {
    return Cookies.get(KEYS.refresh_token)
  }

  get (ctx) {
    return Cookies.get()
  }
}

export default new AuthHelper()
