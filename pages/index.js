import React, { Fragment } from 'react';
import fetch from 'isomorphic-unfetch'
import qs from 'query-string'
import moment from 'moment-immutable'

const PACE_THRESHOLD = (12 * 60)

function humanReadablePace (time) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time - minutes * 60);
  return `${hours ? `${hours}:` : ''}${minutes}:${seconds}`
}

function roundOff (num) {
  return Math.round(num * 100) / 100
}

export default class Index extends React.Component {
  static async getInitialProps ({ req }) {
    const baseUrl = req ? `${req.protocol}://${req.get('Host')}` : '';
    let token
    if (req) {
      token = req.cookies.token
    } else {
      token = localStorage.getItem('token');
    }
    console.log('>>>', token)
    let activities = await fetch(`${baseUrl}/api/activity?${qs.stringify({ afterDate: '2018-02-01'})}`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })
    activities = await activities.json()
    const today = new Date();
    return {
      activities,
      afterDate: `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`
    };
  }

  constructor (props) {
    super();
    this.onSubmit = this.onSubmit.bind(this)
    this.state = {
      afterDate: props.afterDate,
      activities: props.activities,
    }
  }
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  getActivities = async () => {
    const token = localStorage.getItem('token');

    let activities = await fetch(`http://localhost:3000/api/activity?${qs.stringify({ afterDate: this.state.afterDate})}`, {
      headers: {
        authorization: `Bearer ${token}`
      }
    })
    activities = await activities.json()
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
    this.setState({
      activities,
      distance: roundOff(distance),
      averagePace
    })
  }

  onSubmit (e) {
    e.preventDefault()
    this.getActivities();
  }

  render () {
    return (
      <div>
        {}
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
              .filter(activity => activity.activityName === 'Run' && activity.pace < PACE_THRESHOLD)
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
      </div>
    )
  }
}

Index.defaultProps = {
  activities: []
}
