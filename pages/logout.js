import { Component } from 'react'
import Router from 'next/router'

import request from '../utils/api/request'

export default class Callback extends Component {
  async componentDidMount () {
    await request('/authorize/logout', {
      requireAuth: false,
    })

    global.window.localStorage.removeItem('access_token')
    Router.push('/')
  }

  render () {
    return null
  }
}
