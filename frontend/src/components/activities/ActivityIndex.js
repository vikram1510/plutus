import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'
import Pusher from 'pusher-js'

import ActivityListCard from './ActivityListCard'

export default class ActivityIndex extends React.Component {

  constructor() {
    super()
    this.state = {
      activities: null
    }

    this.channel = null
    this.pusher = null
  }

  componentWillUnmount() {
    this.channel.unbind()
    this.pusher.unsubscribe(this.channel)
  }

  componentDidMount() {
    axios.get('/api/activities', { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(res => {
        this.setState({ activities: res.data })
      })
      .then(() => {
        // setup the pusher and binding to receive realtime activities
        this.pusher = new Pusher(process.env.PUSHER_APP_KEY, {
          cluster: 'eu',
          forceTLS: true
        })

        // each user subscribes to their channel to listen of events
        this.channel = this.pusher.subscribe(Auth.getPayload().email)
        this.channel.bind('update', data => {
          this.setState({ activities: [data, ...this.state.activities] })
        })
      })
      .catch(err => console.log(err.response.data))
  }

  render() {
    const { activities } = this.state
    return (
      <div className='container'>
        {activities && activities.map(activity => <ActivityListCard key={activity.id} activity={activity} user={Auth.getPayload()} />)}
      </div>
    )
  }
}
