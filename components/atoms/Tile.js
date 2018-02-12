import { Fragment } from 'react'

import colors from '../../styles/colors'
import spacing from '../../styles/spacing'
import typography from '../../styles/typography'

export default function Tile ({ title, value, label, children }) {
  return (
    <div className="tile--container">
      <div className="tile">
        {!children &&
          <Fragment>
            <h3>{title}</h3>
            <div className="metrics">
              <strong className="value">{value}</strong>
              <label>{label}</label>
            </div>
          </Fragment>
        }
        {!!children &&
          <Fragment>
            {title && <h3>{title}</h3>}
            {children}
          </Fragment>
        }
      </div>
      <style jsx>{`
        h3 {
          font-size: ${typography.text.small};
          text-transform: uppercase;
          margin-bottom: 1rem;
          font-weight: normal;
          color: ${colors.darkGrey};
        }
        .tile--container {
          padding: ${spacing.small};
          flex: 1;
          text-align: center;
        }
        .metrics {
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        @media(min-width: 768px) {
          .tile--container {
            text-align: left;
          }
          .metrics {
            justify-content: flex-start;
          }
        }
        .value {
          font-size: ${typography.text.xlarge};
          padding-right: ${spacing.small};
          line-height: ${typography.text.xlarge};
        }
        label {
          color ${colors.grey};
          white-space: nowrap;
        }
        .tile {
          padding: ${spacing.medium};
          min-width: 160px;
          background: ${colors.white};
          box-shadow: 0 4px 4px -1px ${colors.grey};
          border-radius: 2px;
          height: 100%;
        }
        .title {
          font-size: ${typography.text.small};
          font-weight: normal;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  )
}
