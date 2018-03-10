import React from 'react'
import PropTypes from 'prop-types'

import RequestHelper from '../utils/api/request'

export default function withUser (WrappedComponent) {
  return class GetUser extends React.Component {
    static propTypes = {
      auth: PropTypes.object,
    }

    constructor () {
      super()

      this.state = {
        user: {
          avatar: '',
          firstName: '',
        },
      }
    }

    async componentDidMount () {
      let { body } = await RequestHelper.request('/profile')

      if (body) this.setState({ user: body.user })
    }

    render () {
      return <WrappedComponent {...this.state} {...this.props} />
    }
  }
}
