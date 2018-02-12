import React, { Fragment } from 'react';
import fetch from 'isomorphic-unfetch'
import qs from 'query-string'
import moment from 'moment-immutable'
import numeral from 'numeral'
import { DateRange } from 'react-date-range';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts'

import ClickBoundary from '../components/helpers/ClickOutside'
import request from '../utils/api/request'
import Layout from '../components/Layout'
import Title from '../components/atoms/Title'
import Tiles from '../components/atoms/Tiles'
import Tile from '../components/atoms/Tile'

import colors from '../styles/colors'
import spacing from '../styles/spacing'
import typography from '../styles/typography'

import Calendar from '../static/images/calendar.svg';

const PACE_THRESHOLD = (12 * 60)

function humanReadablePace (time) {
  if (Number.isNaN(time)) return '00:00';
  const hours = Math.floor(time / 3600);
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time - minutes * 60);
  if (minutes < 10) minutes = `0${minutes}`
  if (seconds < 10) seconds = `0${seconds}`
  return `${hours ? `${hours}:` : ''}${minutes}:${seconds}`
}

function roundOff (num) {
  if (Number.isNaN(num)) return '0.00'
  return (Math.round(num * 100) / 100).toFixed(2)
}

function parseActivities (activities) {
  activities = activities
    .filter(a => a.pace < PACE_THRESHOLD)
    .map(a => {
      a.timestamp = moment(a.startTime).format('MM-DD-YYYY, h:mm a')
      a.minutePace = (a.pace / 60).toFixed(2)
      return a
    })

  const paces = activities
    .map(a => a.pace)
    .reduce((total, pace) => total += pace, 0)
  const heartRates = activities
    .map(a => a.averageHeartRate)
    .reduce((total, hr) => total += hr, 0)
  const distance = activities
    .reduce((total, { distance = 0, pace }) => {
      if (pace < PACE_THRESHOLD) total += distance
      return total
    }, 0)
  const steps = activities
    .reduce((total, { steps = 0 }) => {
      return total += steps
    }, 0)

  const averagePaceDec = paces / activities.length
  const averagePace = humanReadablePace(averagePaceDec)
  const averageHeartRate = roundOff(heartRates / activities.length)
  return {
    activities,
    averagePace,
    averagePaceDec,
    averageHeartRate,
    steps: numeral(steps).format('0,0'),
    distance: roundOff(distance),
  }
}

export default class Index extends React.Component {
  static async getInitialProps ({ req }) {
    const baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';
    const afterDate = moment().startOf('month').format('YYYY-MM-DD');
    const beforeDate = moment().format('YYYY-MM-DD');

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
      ...parseActivities(activities),
    };
  }

  constructor (props) {
    super(props)
    this.state = {
      ...props
    }
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSelect = ({ startDate, endDate }) => {
    console.log(endDate)
    if (!endDate) return
    this.setState({
      afterDate: startDate.format('YYYY-MM-DD'),
      beforeDate: endDate.format('YYYY-MM-DD')
    }, () => this.getActivities())
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
    this.getActivities();
  }

  toggleCalendar = (calendarOpen) => {
    this.setState({
      calendarOpen,
    })
  }

  render () {
    const {
      distance,
      averagePace,
      averageHeartRate,
      steps,
      activities,
      beforeDate,
      afterDate,
    } = this.state
    const chartdata = activities.sort((a, b) => {
      const aMoment = moment(a.startTime)
      const bMoment = moment(b.startTime)
      if (aMoment.isBefore(bMoment)) return -1;
      if (aMoment.isAfter(bMoment)) return 1;
      return 0;
    })
    const header = (
      <form onSubmit={this.onSubmit} className="container form">
        <label>Date range:</label>
        <ClickBoundary onClickOutside={() => {
          if (this.state.calendarOpen) this.toggleCalendar(false)
        }}>
          <Fragment>
            <span
              className="datepicker-input"
              onClick={() => this.toggleCalendar(!this.state.calendarOpen)}
            >
              <span>{`${moment(afterDate, 'YYYY-MM-DD').format('MMMM D, Y')} to ${moment(beforeDate, 'YYYY-MM-DD').format('MMMM D, Y')}`}</span>
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
        <style jsx>{`
          form {
            display: flex;
            justify-content: flex-end;
            align-items: center
          }
          label {
            margin-right: ${spacing.small};
            color: ${colors.darkGrey};
            font-size: ${typography.text.small};
            text-transform: uppercase;
          }
          .form {
            position: relative;
          }
          .datepicker {
            top: 100%;
            position: absolute;
            right: 0;
            box-shadow: 0 4px 4px -1px ${colors.grey};
            border-radius: 2px;
            z-index: 1;
          }
          .form {
            display: flex;
            justify-content: flex-end;
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
            align-self: flex-end
            align-items: center;
          }
          .datepicker-input:focus {
            outline: 0;
            background: ${colors.fadedWhite};
          }
        `}</style>
      </form>
    )
    const [selectedActivity] = activities
    let selectedActivityStartTime
    if (selectedActivity) {
      selectedActivityStartTime = moment(selectedActivity.startTime)
    }
    return (
      <Layout title="Dashboard" header={header}>
        <Tiles>
          <Tile title="Total activities" value={activities.length} />
          <Tile title="Total distance" label="miles" value={distance} />
          <Tile title="Total steps" value={steps} />
          <Tile title="Average pace" label="/ mile" value={averagePace} />
          <Tile title="Average HR" label="bpm" value={averageHeartRate} />
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
                  {this.state.activities
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
          <Tile title="Compare your runs">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartdata.map(a => { a.date = moment(a.startTime).format('M/D/YY'); return a })} width={600} height={300}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine y={this.state.averagePaceDec / 60} stroke={colors.orange} isFront strokeDasharray="3 3" />
                  <CartesianGrid strokeDasharray="1 6"/>
                  <Line type="monotone" dataKey="minutePace" stroke={colors.green} strokeWidth={2} />
                  <Line type="monotone" dataKey="distance" stroke={colors.blue} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
          </Tile>
        </Tiles>
        <style jsx>{`
          .suffix {
            color: ${colors.grey}
            font-size: ${typography.text.small}
            padding-left: ${spacing.small}
          }
          .table-container {
            max-height: 360px;
            overflow:auto;
          }
          .table-container table {
            width: calc(100% - ${spacing.small})
          }
          ::-webkit-scrollbar {
            width: ${spacing.small};
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background ${colors.grey};
            border-radius: 12px;
          }
        `}</style>
      </Layout>
    )
  }
}

Index.defaultProps = {
  activities: []
}
