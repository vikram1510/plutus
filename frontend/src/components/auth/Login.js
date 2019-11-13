import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'

export default class Login extends React.Component {
  constructor() {
    super()

    this.state = {
      data: {
        email: '',
        password: ''
      }
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange({ target: { name, value } }) {
    const data = { ...this.state.data, [name]: value }
    this.setState({ data })
    console.log(data)
  }

  onSubmit(e) {
    e.preventDefault()

    axios.post('/api/login', this.state.data)
      .then(res => Auth.setToken(res.data.token))
      .then(() => this.props.history.push('/'))
      .catch(err => console.log(err))
  }

  render() {
    return (
      <section>
        <div>
          <form onSubmit={this.onSubmit}>
            <h2>Login</h2>
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
                  type='password'
                  name='password'
                  placeholder='Password'
                  onChange={this.onChange}
                />
              </div>
            </div>
            <button type='submit'>Login</button>
          </form>
        </div>
      </section>
    )
  }
}
