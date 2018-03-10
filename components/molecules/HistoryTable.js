import PropTypes from 'prop-types'

import { roundOff } from '../../utils/helpers/numbers'
import { humanReadablePace } from '../../utils/helpers/datetime'

import colors from '../../styles/colors'
import spacing from '../../styles/spacing'
import typography from '../../styles/typography'

export default function HistoryTable ({ activities }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Distance</th>
            <th>Pace</th>
          </tr>
        </thead>
        <tbody>
          {activities
            .map(a => (
              <tr key={a.logId}>
                <td>{a.timestamp}</td>
                <td>{roundOff(a.distance)}<span className="suffix">miles</span></td>
                <td>{humanReadablePace(a.pace)}<span className="suffix">/ mile</span></td>
              </tr>
            ))}
        </tbody>
      </table>
      <style jsx>{`
        .suffix {
          color: ${colors.grey};
          font-size: ${typography.text.small};
          padding-left: ${spacing.small};
        }
        .table-container {
          max-height: 360px;
          overflow:auto;
        }
        .table-container table {
          width: calc(100% - ${spacing.small});
        }
        ::-webkit-scrollbar {
          width: ${spacing.small};
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${colors.grey};
          border-radius: 12px;
        }
      `}</style>
    </div>
  )
}

HistoryTable.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.shape({
    logId: PropTypes.number,
    timestamp: PropTypes.string,
    distance: PropTypes.number,
    pace: PropTypes.number,
  })),
}
