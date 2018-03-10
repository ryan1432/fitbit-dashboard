import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-immutable'

import RequestHelper from '../utils/api/request'
import { parseActivities } from '../utils/normalizers/activity'

import Layout from '../components/Layout'
import Tiles from '../components/atoms/Tiles'
import Tile from '../components/atoms/Tile'

import Mask from '../components/molecules/Mask'
import Header from '../components/molecules/Header'

import HistoryChart from '../components/molecules/HistoryChart'
import HistoryTable from '../components/molecules/HistoryTable'

import { DATE_FORMAT } from '../consts'

export class Index extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      activities: [],
      distance: 100,
      averagePace: '8:30',
      averageHeartRate: 165,
      maxDistance: 2,
      minDistance: 8,
      maxPace: 9,
      minPace: 6,
      steps: 10000,
      beforeDate: moment().format('YYYY-MM-DD'),
      afterDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      loading: true,
    }
  }

  async componentDidMount () {
    const beforeDateMoment = moment()
    let afterDateMoment = beforeDateMoment.startOf('month')

    if (beforeDateMoment.diff(afterDateMoment, 'days') < 7) {
      afterDateMoment = beforeDateMoment.subtract(7, 'days')
    }

    const beforeDate = beforeDateMoment.format('YYYY-MM-DD')
    const afterDate = afterDateMoment.format('YYYY-MM-DD')

    let { body, error } = await RequestHelper.request('/activity', {
      params: {
        afterDate,
        beforeDate,
      },
    })

    if (error) {
      console.warn(error)
      return this.setState({ error, blocked: true })
    }

    this.setState({
      afterDate,
      beforeDate,
      loading: false,
      ...parseActivities(body),
    })
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

  getActivities = async (req) => {
    const { beforeDate, afterDate } = this.state
    this.setState({ loading: true })
    const { body: activities } = await RequestHelper.request('/activity', {
      params: {
        beforeDate,
        afterDate,
      },
    })

    this.setState({
      loading: false,
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
      maxDistance,
      minDistance,
      maxPace,
      minPace,
      steps,
      beforeDate,
      afterDate,
      activities,
      blocked,
      calendarOpen,
      loading,
    } = this.state

    const activitiesAsc = activities.concat().sort((a, b) => {
      const aMoment = moment(a.startTime)
      const bMoment = moment(b.startTime)
      if (aMoment.isBefore(bMoment)) return -1
      if (aMoment.isAfter(bMoment)) return 1
      return 0
    })

    return (
      <Fragment>
        <Layout
          title={`${moment(afterDate).format(DATE_FORMAT.medium)} - ${moment(beforeDate).format(DATE_FORMAT.medium)} | Fitbit Activity Summary`}
          blur={blocked || loading }
          header={
            <Header
              beforeDate={beforeDate}
              afterDate={afterDate}
              calendarOpen={calendarOpen}
              onCalendarToggle={this.toggleCalendar}
              onDateSelect={this.handleSelect}
            />
          }
        >
          <Tiles>
            <Tile title="Total activities" value={activities.length} type="positive" />
            <Tile title="Total distance" label="miles" value={distance} type="positive" />
            <Tile title="Total steps" value={steps} type="positive"/>
            <Tile title="Average pace" label="/ mile" value={averagePace} type="info" />
            <Tile title="Average HR" label="bpm" value={averageHeartRate} type="info" />
          </Tiles>
          <Tiles>
            <Tile>
              <HistoryTable activities={activities} />
            </Tile>
            <Tile align="center">
              <HistoryChart
                activities={activitiesAsc}
                minDistance={minDistance}
                maxDistance={maxDistance}
                minPace={minPace}
                maxPace={maxPace}
              />
            </Tile>
          </Tiles>
        </Layout>
        {<Mask visible={blocked} />}
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
  auth: PropTypes.object,
}

export default Index
