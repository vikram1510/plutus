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

  onChange({ target: { name, value } }) {
    const data = { ...this.state.data, [name]: value }
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
        <div>
          <form onSubmit={this.onSubmit}>
            <h2>Register</h2>
            <div>
              <label>Username</label>
              <div>
                <input
                  name='username'
                  placeholder='Username'
                  onChange={this.onChange}
                />
              </div>
            </div>
            <div>
              <label>Email</label>
              <div>
                <input
                  name='email'
                  placeholder='Email'
                  onChange={this.onChange}
                />
              </div>
            </div>
            <div>
              <label>Password</label>
              <div>
                <input
                  name='password'
                  type='password'
                  placeholder='Password'
                  onChange={this.onChange}
                />
              </div>
            </div>
            <div>
              <label>Password Confirmation</label>
              <div>
                <input
                  name='password_confirmation'
                  type='password'
                  placeholder='Password Confirmation'
                  onChange={this.onChange}
                />
              </div>
            </div>
            <button type='submit'>Register</button>
          </form>
        </div>
      </section>
    )
  }
}
