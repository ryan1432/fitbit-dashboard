import { Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-immutable'
import { DateRange } from 'react-date-range'

import ClickBoundary from '../helpers/ClickOutside'

import { DATE_FORMAT } from '../../utils/constants'

import colors from '../../styles/colors'
import spacing from '../../styles/spacing'
import typography from '../../styles/typography'

import Calendar from '../../static/images/calendar.svg'

const TODAY = moment()

export default function DateRangePicker ({
  afterDate,
  beforeDate,
  open,
  onSelect,
  onToggle,
}) {
  return (
    <div className="datepicker-container">
      <label>Date range:</label>
      <ClickBoundary onClickOutside={() => {
        if (open) onToggle(false)
      }}>
        <Fragment>
          <span className="datepicker-input" onClick={() => onToggle(!open)}>
            <span className="datepicker-range-text">
              <span>{moment(afterDate, DATE_FORMAT.short).format(DATE_FORMAT.long)}</span>
              <span>to</span>
              <span>{moment(beforeDate, DATE_FORMAT.short).format(DATE_FORMAT.long)}</span>
            </span>
            <Calendar className="icon--small icon--text-color"/>
          </span>
          {open &&
            <div className="datepicker" onClick={e => e.stopPropagation()}>
              <DateRange
                startDate={moment(afterDate, DATE_FORMAT.short)}
                endDate={moment(beforeDate, DATE_FORMAT.short)}
                maxDate={TODAY.startOf('day')}
                minDate={TODAY.subtract(1, 'year')}
                onInit={onSelect}
                onChange={onSelect}
              />
            </div>
          }
        </Fragment>
      </ClickBoundary>
      <style jsx>{`
        .datepicker-range-text {
          display: flex;
          align-items: center;
        }

        .datepicker-range-text span:not(:last-child) {
          padding: 0 ${spacing.small} 0 0;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .datepicker-container {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          position: relative;
        }

        .datepicker-container label {
          display: none;
          margin-right: ${spacing.small};
          color: ${colors.darkGrey};
          font-size: ${typography.text.small};
          text-transform: uppercase;
        }

        .datepicker {
          position: absolute;
          box-shadow: 0 4px 4px -1px ${colors.grey};
          z-index: 1;
          width: auto;
          left: -${spacing.large};
          right: -${spacing.large};
          max-width: 100vw;
        }

        .datepicker :global(.rdr-Calendar) {
          margin: auto;
          display: block !important;
        }

        .datepicker-input {
          background: transparent;
          color: ${colors.text};
          padding: ${spacing.small};
          font-size: ${typography.text.medium};
          border: 1px solid ${colors.border};
          -webkit-font-smoothing: antialiased;
          cursor: pointer;
          display: flex;
          align-self: flex-end;
          align-items: center;
        }

        .datepicker-input:focus {
          outline: 0;
          background: ${colors.fadedWhite};
        }

        @media (min-width: 768px) {
          .datepicker {
            top: 100%;
            right: 0;
            left: auto;
            border-radius: 2px;
            width: 560px;
          }
          .datepicker :global(.rdr-Calendar) {
            width: 50%;
            display: inline-block !important;
            margin: inherit;
          }
          .datepicker-container label {
            display: inline;
          }
        }
      `}</style>
    </div>
  )
}

DateRangePicker.propTypes = {
  afterDate: PropTypes.string.isRequired,
  beforeDate: PropTypes.string.isRequired,
  open: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
}
