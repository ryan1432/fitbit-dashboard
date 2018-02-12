import React, { Fragment } from 'react';
import fetch from 'isomorphic-unfetch'
import qs from 'query-string'
import moment from 'moment-immutable'
import numeral from 'numeral'

import request from '../utils/api/request'
import Layout from '../components/Layout'
import Title from '../components/atoms/Title'
import Tiles from '../components/atoms/Tiles'
import Tile from '../components/atoms/Tile'

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

  const averagePace = humanReadablePace(paces / activities.length)
  const averageHeartRate = roundOff(heartRates / activities.length)
  return {
    activities,
    averagePace,
    averageHeartRate,
    steps: numeral(steps).format('0,0'),
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
    const { distance, averagePace, averageHeartRate, steps, activities } = this.state

    const header = (
      <form onSubmit={this.onSubmit} className="container">
        <input type="text" onChange={this.handleChange} value={this.state.afterDate} name="afterDate" />
      </form>
    )
    return (
      <Layout title="Dashboard" header={header}>
        <Tiles>
          <Tile title="Total activities" value={activities.length} />
          <Tile title="Total distance" label="miles" value={distance} />
          <Tile title="Average pace" label="/ mile" value={averagePace} />
          <Tile title="Average heart rate" label="bpm" value={averageHeartRate} />
          <Tile title="Total steps" value={steps} />
        </Tiles>
        <Title tag="h2">Your last <strong>5</strong> runs</Title>
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
              .slice(0, 5)
              .map(a => (
                <tr key={a.logId}>
                  <td>{a.startTime}</td>
                  <td>{roundOff(a.distance)}</td>
                  <td>{humanReadablePace(a.pace)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Layout>
    )
  }
}

Index.defaultProps = {
  activities: []
}
