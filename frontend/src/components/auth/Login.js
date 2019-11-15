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
      },
      errors: {}
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange({ target: { id, value } }) {
    const data = { ...this.state.data, [id]: value }
    const errors = {}
    this.setState({ data, errors })
  }

  onSubmit(e) {
    e.preventDefault()

    axios.post('/api/login', this.state.data)
      .then(res => Auth.setToken(res.data.token))
      .then(() => this.props.history.push('/'))
      .catch(err => this.setState({ errors: err.response.data }))
  }

  render() {
    const { errors } = this.state
    return (
      <section>
        <form onSubmit={this.onSubmit}>
          <h2>Login</h2>
          <div>
            <input id='email' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='email'>Email</label>
          </div>
          <div>
            <input id='password' type='password' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='password'>Password</label>
            {errors.message && <div className='error-message'>{errors.message}</div>}
          </div>
          <button type='submit'>Login</button>
        </form>
      </section>
    )
  }
}
