import React from 'react'
import axios from 'axios'
import queryString from 'query-string'

export default class Register extends React.Component {
  constructor() {
    super()

    this.state = {
      data: {
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        invite_key: ''
      },
      inviteData: {},
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

  componentDidMount(){

    if (this.props.location.search){
      const queryValues = queryString.parse(this.props.location.search)
      const inviteKey = queryValues.invite_key
  
      if (inviteKey) {
  
        axios.get(`/api/invites/${inviteKey}`)
          .then(res => {
            this.setState({ inviteData: res.data, data: { ...this.state.data, invite_key: res.data.key, email: res.data.email } } )
          })
          .catch(() => {
            console.error('invitation key expired or does not exists! Act normal and just register!')
          })
      }
    }
  }

  onSubmit(e) {
    e.preventDefault()

    axios.post('/api/register', this.state.data)
      .then(() => this.props.history.push('/'))
      .catch(err => this.setState({ errors: err.response.data }))
  }


  render() {
    const { errors, inviteData, data } = this.state
    return (
      <section>
        {inviteData && <InviterDetail {...inviteData.inviter}/>}
        <form onSubmit={this.onSubmit}>
          <h2>Register</h2>
          <div>
            <input id='username' placeholder=' ' onChange={this.onChange}/>
            <label htmlFor='username'>Username</label>
            {errors.username && <div className='error-message'>{errors.username}</div>}
          </div>
          <div>
            <input id='email' placeholder=' ' value={data.email} onChange={this.onChange}/>
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


const InviterDetail = ({ username, profile_image: profileImage }) => (
  <div className='container-no-bg friend-show'>
    {!username && <h2>Invitation link expired or does not exists.</h2>}
    {username && 
      <>
        <figure className='placeholder-figure friend-show'>
          <img src={profileImage}></img>
        </figure>
        <h2><strong>{username}</strong> has invited you to Plutus.</h2>
      </>
    }
  </div>
)
