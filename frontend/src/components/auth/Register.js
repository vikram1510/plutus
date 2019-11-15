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
      },
      errors: {}
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  onChange({ target: { id, value } }) {
    const data = { ...this.state.data, [id]: value }
    const errors = { ...this.state.errors, [id]: '' }
    this.setState({ data, errors })
  }

  onSubmit(e) {
    e.preventDefault()

    axios.post('/api/register', this.state.data)
      .then(() => this.props.history.push('/'))
      .catch(err => this.setState({ errors: err.response.data }))
  }

  render() {
    const { errors } = this.state
    return (
      <section>
        <form onSubmit={this.onSubmit}>
          <h2>Register</h2>
          <div>
            <input id='username' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='username'>Username</label>
            {errors.username && <div className='error-message'>{errors.username}</div>}
          </div>
          <div>
            <input id='email' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='email'>Email</label>
            {errors.email && <div className='error-message'>{errors.email}</div>}
          </div>
          <div>
            <input id='password' type='password' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='password'>Password</label>
            {errors.password && <div className='error-message'>{errors.password}</div>}
          </div>
          <div>
            <input id='password_confirmation' type='password' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='password_confirmation'>Password Confirmation</label>
            {errors.password_confirmation && <div className='error-message'>{errors.password_confirmation}</div>}
          </div>
          <button type='submit'>Register</button>
        </form>
      </section>
    )
  }
}
