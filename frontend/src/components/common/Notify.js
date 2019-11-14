import React from 'react'
import Pusher from 'pusher-js'
import axios from 'axios'

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true

// const pusher = new Pusher(process.env.PUSHER_APP_KEY, {
//   cluster: 'eu',
//   forceTLS: true
// })

// const channel = pusher.subscribe('my-channel')
// channel.bind('my-event', function (data) {
//   alert(JSON.stringify(data))
// })

export default class Notify extends React.Component {
  constructor() {
    super()

    this.state = {
      data: {
        pusher_message: ''
      }
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)

    this.pusher = new Pusher(process.env.PUSHER_APP_KEY, {
      cluster: 'eu',
      forceTLS: true
    })
    this.channel = this.pusher.subscribe('my-channel')
    this.channel.bind('my-event', function (data) {
      alert(JSON.stringify(data))
    })
  }


  onChange({ target: { id, value } }) {
    const data = { ...this.state.data, [id]: value }
    this.setState({ data })
  }

  onSubmit(e) {
    e.preventDefault()

    axios.post('/api/pusher', this.state.data)
      .catch(err => console.log(err))
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <div>
          <input id='pusher_message' placeholder=' ' onChange={this.onChange} />
          <label htmlFor='pusher_message'>Message</label>
        </div>
        <button type='submit'>Push!</button>
      </form>
    )
  }
}
