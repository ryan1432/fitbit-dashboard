import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-immutable'
import { DateRange } from 'react-date-range'
import { Text, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine, Legend } from 'recharts'
import Link from 'next/link'

import request from '../utils/api/request'
import { roundOff } from '../utils/helpers/numbers'
import { humanReadablePace } from '../utils/helpers/datetime'
import { parseActivities } from '../utils/normalizers/activity'

import ClickBoundary from '../components/helpers/ClickOutside'
import Layout from '../components/Layout'
import Tiles from '../components/atoms/Tiles'
import Tile from '../components/atoms/Tile'
import CustomTooltip from '../components/molecules/CustomTooltip'
import Mask from '../components/molecules/Mask'

import withUser from '../components/User'

import colors from '../styles/colors'
import spacing from '../styles/spacing'
import typography from '../styles/typography'

import Calendar from '../static/images/calendar.svg'

export class Index extends React.Component {
  static async getInitialProps ({ req }) {
    const afterDate = moment().startOf('month').format('YYYY-MM-DD')
    const beforeDate = moment().format('YYYY-MM-DD')
    let token
    if (req) {
      // console.log('server')
      token = req.cookies.access_token
      // console.log(req.cookies.expires_in)
    } else {
      // console.log('browser')
      token = global.window.localStorage.getItem('access_token')
      // console.log(global.window.localStorage.getItem('token'))
      // console.log(global.window.localStorage.getItem('expires_in'))
    }
    if (!token || token === 'undefined') {
      return {
        beforeDate,
        afterDate,
        blocked: true,
      }
    }
    let activities = await request('/activity', {
      req,
      params: {
        afterDate,
        beforeDate,
      },
    })
    return {
      afterDate,
      beforeDate,
      blocked: !token,
      ...parseActivities(activities),
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      ...props,
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleSelect = ({ startDate, endDate }) => {
    this.setState({
      __afterDate: startDate.format('YYYY-MM-DD'),
      __beforeDate: endDate.format('YYYY-MM-DD'),
    })
  }

  getActivities = async () => {
    const { beforeDate, afterDate } = this.state
    const activities = await request('/activity', {
      params: {
        beforeDate,
        afterDate,
      },
    })

    this.setState({
      ...parseActivities(activities),
    })
  }

  onSubmit = (e) => {
    e.preventDefault()
    this.getActivities()
  }

  toggleCalendar = (calendarOpen) => {
    let {
      beforeDate,
      __beforeDate,
      afterDate,
      __afterDate,
    } = this.state
    let nextBeforeDate
    let nextAfterDate
    if (!calendarOpen) {
      nextBeforeDate = __beforeDate
      nextAfterDate = __afterDate
    }
    this.setState({
      calendarOpen,
      beforeDate: nextBeforeDate || beforeDate,
      afterDate: nextAfterDate || afterDate,
    }, () => {
      if (calendarOpen) return
      if (beforeDate !== nextBeforeDate || afterDate !== nextAfterDate) {
        this.getActivities()
      }
    })
  }

  render () {
    const {
      distance,
      averagePace,
      averageHeartRate,
      steps,
      beforeDate,
      afterDate,
      activities,
    } = this.state
    const { blocked } = this.props
    const activitiesAsc = activities.concat().sort((a, b) => {
      const aMoment = moment(a.startTime)
      const bMoment = moment(b.startTime)
      if (aMoment.isBefore(bMoment)) return -1
      if (aMoment.isAfter(bMoment)) return 1
      return 0
    })

    const { user } = this.props
    const header = (
      <form onSubmit={this.onSubmit} className="container form">
        <div className="avatar">
          <img src={user.avatar} />
          <span className="greting">
            Heya, {user.firstName}!
            <small>Not you? <Link href="/logout" prefetch><a className="test">Log out</a></Link></small>
          </span>
        </div>
        <div className="datepicker-container">
          <label>Date range:</label>
          <ClickBoundary onClickOutside={() => {
            if (this.state.calendarOpen) this.toggleCalendar(false)
          }}>
            <Fragment>
              <span
                className="datepicker-input"
                onClick={() => this.toggleCalendar(!this.state.calendarOpen)}
              >
                <span className="datepicker-range-text">
                  <span>{moment(afterDate, 'YYYY-MM-DD').format('MMMM D, Y')}</span>
                  <span>to</span>
                  <span>{moment(beforeDate, 'YYYY-MM-DD').format('MMMM D, Y')}</span>
                </span>
                <Calendar className="icon--small icon--text-color"/>
              </span>
              {this.state.calendarOpen &&
                <div className="datepicker" onClick={e => e.stopPropagation()}>
                  <DateRange
                    startDate={moment(this.state.afterDate, 'YYYY-MM-DD')}
                    endDate={moment(this.state.beforeDate, 'YYYY-MM-DD')}
                    maxDate={moment().startOf('day')}
                    minDate={moment().subtract(1, 'year')}
                    onInit={this.handleSelect}
                    onChange={this.handleSelect}
                  />
                </div>
              }
            </Fragment>
          </ClickBoundary>
        </div>

        <style jsx>{`
          form {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: column;
          }
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
          @media(min-width: 768px) {
            .form {
              flex-direction: row;
            }
            .avatar {
              margin-bottom: 0;
            }
          }
          .avatar {
            display: flex;
            align-items: center;
            margin-bottom: ${spacing.small};
          }
          .greeting {
            display: flex;
            align-items: flex-end;
          }
          small {
            font-size: ${typography.text.small};
            margin-left: ${spacing.small};
          }
          small a {
            color: ${colors.text};
            text-decoration: none;
            margin-left: ${spacing.small};
          }
          .avatar img {
            overflow: hidden;
            border-radius: 100px;
            width: 50px;
            height: 50px;
            margin-right: ${spacing.small};
          }
          .datepicker-container {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            position: relative;
          }
          .datepicker-container label {
            display: none;
          }
          @media (min-width: 768px) {
            .datepicker-container label {
              display: inline;
            }
          }
          label {
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
          @media (min-width: 768px) {
            .datepicker {
              top: 100%;
              right: 0;
              border-radius: 2px;
              width: 560px;
            }
            .datepicker :global(.rdr-Calendar) {
              width: 50%;
              display: inline-block !important;
              margin: inherit;
            }
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
        `}</style>
      </form>
    )

    return (
      <Fragment>
        <Layout title="Dashboard" header={header} blur={blocked}>
          <Tiles>
            <Tile title="Total activities" value={activities.length} type="positive" />
            <Tile title="Total distance" label="miles" value={distance} type="positive" />
            <Tile title="Total steps" value={steps} type="positive"/>
            <Tile title="Average pace" label="/ mile" value={averagePace} type="info" />
            <Tile title="Average HR" label="bpm" value={averageHeartRate} type="info" />
          </Tiles>
          <Tiles>
            <Tile>
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
              </div>
            </Tile>
            <Tile align="center">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={activitiesAsc.map(a => { a.date = moment(a.startTime).format('M/D/YY'); return a })}
                  width={600}
                  height={300}
                  margin={{top: 0, right: 0, left: -10, bottom: 0}}
                >
                  <XAxis dataKey="startTime" tickFormatter={v => moment(v).format('M/D')} />
                  <YAxis label={{ value: 'MPH', angle: -90, position: 'center', y: 100 }} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={v => v || ''} label={{ value: 'BPM', angle: 90, position: 'center', dx: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={this.state.averagePaceDec / 60} stroke={colors.orange} isFront strokeDasharray="3 3" />
                  <CartesianGrid strokeDasharray="1 6"/>
                  <Line name="Pace" unit="mph" type="monotone" dataKey="minutePace" stroke={colors.green} strokeWidth={2} />
                  <Line name="Distance" unit="miles" type="monotone" dataKey="distance" stroke={colors.blue} strokeWidth={2} />
                  <Line yAxisId="right" name="HR" unit="bpm" type="monotone" dataKey="averageHeartRate" stroke={colors.orange} />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </Tile>
          </Tiles>
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
        </Layout>
        {blocked && <Mask />}
      </Fragment>
    )
  }
}

Index.defaultProps = {
  activities: [],
}

Index.propTypes = {
  user: PropTypes.shape({
    avatar: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
  }),
  blocked: PropTypes.bool,
}

export default withUser(Index)
