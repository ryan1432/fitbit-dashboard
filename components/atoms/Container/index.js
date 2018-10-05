import PropTypes from 'prop-types'

import spacing from '../../../styles/spacing'

export default function Container ({ children, max }) {
  return (
    <div className="container">
      {children}
      <style jsx>{`
        .container {
          width: 100%;
          max-width: ${max};
          padding: 0 ${spacing.small};
          margin: auto;
        }
      `}</style>
    </div>
  )
}

Container.propTypes = {
  children: PropTypes.any,
  max: PropTypes.string,
}

Container.defaultProps = {
  max: '1024px',
}
