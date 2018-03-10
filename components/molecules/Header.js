import PropTypes from 'prop-types'
import Avatar from './Avatar'
import DateRangePicker from './DateRangePicker'

import withUser from '../User'

function Header ({
  user,
  beforeDate,
  afterDate,
  onDateSelect,
  onCalendarToggle,
  calendarOpen,
}) {
  return (
    <div className="container">
      <Avatar user={user} />
      <DateRangePicker
        afterDate={afterDate}
        beforeDate={beforeDate}
        open={calendarOpen}
        onSelect={onDateSelect}
        onToggle={onCalendarToggle}
      />
      <style jsx>{`
        .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-direction: column;
        }
        @media(min-width: 768px) {
          .container {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  )
}

Header.propTypes = {
  user: PropTypes.object,
  beforeDate: PropTypes.string,
  afterDate: PropTypes.string,
  calendarOpen: PropTypes.bool,
  onDateSelect: PropTypes.func,
  onCalendarToggle: PropTypes.func,
}

Header.defaultProps = {
  user: {},
}

export default withUser(Header)
