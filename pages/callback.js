import { Component } from 'react'
import moment from 'moment-immutable'
import Router from 'next/router'

import qs from 'query-string'
import request from '../utils/api/request'
export default class Callback extends Component {
  async componentDidMount () {
    const params = qs.parse(window.location.search)
    const authorizaton = await request('/authorize', {
      params,
      requireAuth: false,
    })

    global.window.localStorage.setItem('access_token', authorizaton.access_token)
    global.window.localStorage.setItem('refresh_token', authorizaton.refresh_token)
    global.window.localStorage.setItem('expires', moment().add(params.expires_in, 'seconds'))
    Router.push('/')
  }

  render () {
    return null
  }
}
