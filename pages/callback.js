import { Component } from 'react'
import Router from 'next/router'
import qs from 'query-string'

import RequestHelper from '../utils/api/request'
import AuthHelper from '../utils/api/auth'

export default class Callback extends Component {
  async componentDidMount () {
    const params = qs.parse(window.location.search)
    const authorizaton = await RequestHelper.request('/authorize', {
      params,
      requireAuth: false,
    })

    AuthHelper.set(authorizaton)

    global.window.localStorage.setItem('access_token', authorizaton.access_token)
    Router.push('/')
  }

  render () {
    return null
  }
}
