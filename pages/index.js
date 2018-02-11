import React, { Fragment } from 'react';
import fetch from 'isomorphic-unfetch'
import qs from 'query-string'
import moment from 'moment-immutable'

import request from '../utils/api/request'
import Layout from '../components/Layout'

const PACE_THRESHOLD = (12 * 60)

function humanReadablePace (time) {
  const hours = Math.floor(time / 3600);
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time - minutes * 60);
  if (minutes < 10) minutes = `0${minutes}`
  if (seconds < 10) seconds = `0${seconds}`
  return `${hours ? `${hours}:` : ''}${minutes}:${seconds}`
}

function roundOff (num) {
  return (Math.round(num * 100) / 100).toFixed(2)
}

function parseActivities (activities) {
  activities = activities
    .filter(a => a.pace < PACE_THRESHOLD)
    .map(a => {
      a.startTime = moment(a.startTime).format('MM-DD-YYYY, h:mm a')
      return a
    })

  const paces = activities
    .map(a => a.pace)
    .reduce((total, pace) => total += pace, 0)
  const distance = activities
    .reduce((total, { distance = 0, pace }) => {
      if (pace < PACE_THRESHOLD) total += distance
      return total
    }, 0)

  const averagePace = humanReadablePace(paces / activities.length)
  return {
    activities,
    averagePace,
    distance: roundOff(distance),
  }
}

export default class Index extends React.Component {
  static async getInitialProps ({ req }) {
    const baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';
    const afterDate = moment().startOf('month').format('YYYY-MM-DD');

    let activities = await request('/activity', {
      req,
      params: {
        afterDate,
      },
    })
    return {
      afterDate,
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

  getActivities = async () => {
    const activities = await request('/activity', {
      params: {
        afterDate: this.state.afterDate,
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

  render () {
    return (
      <Layout title="Dashboard">
        <form onSubmit={this.onSubmit}>
          <input onChange={this.handleChange} value={this.state.afterDate} name="afterDate" />
          <button type="submit">Submit</button>
        </form>
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
                  <td>{a.startTime}</td>
                  <td>{roundOff(a.distance)}</td>
                  <td>{humanReadablePace(a.pace)}</td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td>{this.state.distance}</td>
              <td>{this.state.averagePace}</td>
            </tr>
          </tfoot>
        </table>
      </Layout>
    )
  }
}

Index.defaultProps = {
  activities: []
}
