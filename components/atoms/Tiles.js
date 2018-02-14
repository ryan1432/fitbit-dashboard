import PropTypes from 'prop-types'

import spacing from '../../styles/spacing'

export default function Tiles ({ children }) {
  return (
    <div className="tiles">
      {children}
      <style jsx>{`
        .tiles {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: ${spacing.small};
          margin-left: -${spacing.small};
          margin-right: -${spacing.small};
        }
      `}</style>
    </div>
  )
}

Tiles.propTypes = {
  children: PropTypes.any,
}
