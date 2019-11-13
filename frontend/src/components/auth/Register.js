import React from 'react'
import axios from 'axios'

export default class Register extends React.Component {
  constructor() {
    super()

    this.state = {
      data: {
        username: '',
        email: '',
        password: '',
        password_confirmation: ''
      }
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange({ target: { id, value } }) {
    const data = { ...this.state.data, [id]: value }
    this.setState({ data })
  }

  onSubmit(e) {
    e.preventDefault()

    axios.post('/api/register', this.state.data)
      .then(() => this.props.history.push('/'))
      .catch(err => console.log(err))
  }

  render() {
    return (
      <section>
        <form onSubmit={this.onSubmit}>
          <h2>Register</h2>
          <div>
            <input id='username' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='username'>Username</label>
          </div>
          <div>
            <input id='email' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='email'>Email</label>
          </div>
          <div>
            <input id='password' type='password' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='password'>Password</label>
          </div>
          <div>
            <input id='password_confirmation' type='password' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='password_confirmation'>Password Confirmation</label>
          </div>
          <button type='submit'>Register</button>
        </form>
      </section>
    )
  }
}
