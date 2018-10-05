import PropTypes from 'prop-types'
import Color from 'color'

import spacing from '../../../styles/spacing'
import colors from '../../../styles/colors'

export default function Clickable ({ children, ...props }) {
  return (
    <a {...props}>
      {children}
      <style jsx>{`
        a {
          display: inline-block;
          padding: ${spacing.medium} ${spacing.xlarge};
          background: ${colors.green};
          border-bottom: 3px solid ${Color(colors.green).darken(0.25)};
          text-decoration: none;
          text-transform: uppercase;
          border-radius: 3px;
          color: ${colors.white};
          font-weight: bold;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </a>
  )
}

Clickable.propTypes = {
  children: PropTypes.any,
}
