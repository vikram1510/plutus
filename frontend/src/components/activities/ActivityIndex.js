import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'

import ActivityListCard from './ActivityListCard'

export default class ActivityIndex extends React.Component {

  constructor() {
    super()
    this.state = {
      activities: null
    }
  }

  componentDidMount() {
    console.log('hello')
    axios('/api/activities', { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(res => this.setState({ activities: res.data }))
      .catch(err => console.log(err.response.data))
  }

  render() {
    const { activities } = this.state
    return (
      <div className='container'>
        {activities && activities.map(activity => (
          <ActivityListCard key={activity.id} activity={activity} user={Auth.getPayload()} />
        ))
        }
      </div>
    )
  }
}
