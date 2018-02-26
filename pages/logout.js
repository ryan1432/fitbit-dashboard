import { Component } from 'react'
import Router from 'next/router'

import RequestHelper from '../utils/api/request'

export default class Callback extends Component {
  async componentDidMount () {
    await RequestHelper.request('/authorize/logout', {
      requireAuth: false,
    })

    global.window.localStorage.removeItem('access_token')
    Router.push('/')
  }

  render () {
    return null
  }
}
