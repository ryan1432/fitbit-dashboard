import PropTypes from 'prop-types'
import { humanReadablePace } from '../../utils/helpers/datetime'
import { roundOff } from '../../utils/helpers/numbers'

import spacing from '../../styles/spacing'
import colors from '../../styles/colors'

export default function CustomTooltip ({ payload }) {
  if (!payload || !payload.length) return null
  return (
    <div className="tooltip">
      <ul>
        <li><label>{payload[0].name}:</label> {humanReadablePace(payload[0].value * 60)} {payload[0].unit}</li>
        <li><label>{payload[1].name}:</label> {roundOff(payload[1].value)} {payload[1].unit}</li>
      </ul>

      <style jsx>{`
        ul {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }
        li {
          margin-bottom: ${spacing.small};
        }
        li:last-child {
          margin-bottom: 0;
        }
        .tooltip {
          background: rgba(255,255,255, .9);
          padding: ${spacing.small};
          border: 1px solid ${colors.grey};
        }
      `}</style>
    </div>
  )
}

CustomTooltip.propTypes = {
  payload: PropTypes.array,
}
