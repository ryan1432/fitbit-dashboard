import React from 'react'
import PropTypes from 'prop-types'

import RequestHelper from '../utils/api/request'
import AuthHelper from '../utils/api/auth'

let user

export default function withUser (WrappedComponent) {
  return class GetUser extends React.Component {
    static propTypes = {
      auth: PropTypes.object,
    }

    static async getInitialProps (ctx) {
      const childProps = await WrappedComponent.getInitialProps(ctx)
      if (user) {
        return {
          user,
          ...childProps,
        }
      }

      let { body, auth, error } = await RequestHelper.request('/profile', { req: ctx.req })

      if (error) {
        return {
          ...childProps,
          user: {},
        }
      }

      return {
        user: body.user || {},
        auth,
        ...childProps,
      }
    }

    componentDidMount () {
      AuthHelper.set(this.props.auth)
    }

    render () {
      return <WrappedComponent {...this.props} />
    }
  }
}
