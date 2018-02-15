import PropTypes from 'prop-types'
import moment from 'moment-immutable'

import { humanReadablePace } from '../../utils/helpers/datetime'
import { roundOff } from '../../utils/helpers/numbers'
import spacing from '../../styles/spacing'
import colors from '../../styles/colors'
import typography from '../../styles/typography'

export default function CustomTooltip ({ payload, label, ...rest }) {
  if (!payload || !payload.length) return null
  return (
    <div className="tooltip">
      <ul>
        <li><label><strong>{moment(label).format('MMMM D, YYYY h:mm a')}</strong></label></li>
        <li>
          <label>{payload[2].name}:</label>
          <span className="value orange">{payload[2].value} {payload[2].unit}</span>
        </li>
        <li>
          <label>{payload[0].name}:</label>
          <span className="value green">{humanReadablePace(payload[0].value * 60)} {payload[0].unit}</span>
        </li>
        <li>
          <label>{payload[1].name}:</label>
          <span className="value blue">{roundOff(payload[1].value)} {payload[1].unit}</span>
        </li>
      </ul>

      <style jsx>{`
        ul {
          margin: 0;
          padding: 0;
          list-style-type: none;
          border-radius: 3px;
        }
        .green {
          color: ${colors.green}
        }
        .orange {
          color: ${colors.orange}
        }
        .blue {
          color: ${colors.blue}
        }
        strong, label {
          font-size: ${typography.text.small};
          text-transform:uppercase;
          font-weight: normal;
        }
        li:first-child {
          background: ${colors.background};
          padding: ${spacing.small};
          margin: -${spacing.small};
          margin-bottom: ${spacing.small};
          border-bottom: 1px solid ${colors.grey};
        }
        li:not(:first-child) {
          margin-bottom: ${spacing.small};
          display: flex;
          align-items: flex-end;
          margin-top: ${spacing.small};
        }
        label {
          flex-basis: 45%;
        }
        .value {
          font-weight: bold;
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
  label: PropTypes.string,
}
