import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import ClickOutside from '../helpers/ClickOutside'

import colors from '../../styles/colors'
import spacing from '../../styles/spacing'

export default class Dropdown extends React.Component {
  constructor () {
    super()
    this.state = {}
  }

  toggle = () => {
    this.setState({ open: !this.state.open })
  }

  close = () => {
    if (this.state.open) this.toggle()
  }

  render () {
    const {
      icon,
      label,
      children,
    } = this.props
    const { open } = this.state

    return (
      <div className={classnames('dropdown--container')}>
        <ClickOutside onClickOutside={this.close}>
          {icon && <button className={classnames(open && 'open')} onClick={this.toggle}>{label} {icon}</button>}
          {open &&
            <div className="dropdown--content">
              {children}
            </div>
          }
        </ClickOutside>
        <style jsx>{`
          .dropdown--container {
            position: relative;
            display: inline-block;
            z-index: 0;
          }
          button {
            background: transparent;
            border: 0;
            outline: 0;
            appearance: none;
            background: ${colors.white};
            border: 1px solid transparent;
            border-radius: 3px 3px 0 0;
            z-index: 1;
            cursor: pointer;
          }
          .dropdown--content {
            position: absolute;
            right: 0;
            margin-top: -1px;
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 3px 0 3px 3px;
            z-index: -1;
            padding: ${spacing.medium};
          }
          .open {
            border: 1px solid ${colors.border};
            border-bottom-color: transparent;
          }
        `}</style>
      </div>
    )
  }
}

Dropdown.propTypes = {
  children: PropTypes.any,
  label: PropTypes.string,
  icon: PropTypes.node,
}
