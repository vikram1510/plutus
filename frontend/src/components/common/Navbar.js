import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import Auth from '../../lib/auth'

class Navbar extends React.Component {
  constructor() {
    super()

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout() {
    Auth.logout()
    this.props.history.push('/')
  }

  render() {
    const authenticated = Auth.isAuthenticated()
    const { username } = Auth.getPayload()
    return (
      <nav>
        <div>
          <Link to='/'>Home</Link>
          <Link to='/expenses'>Expense</Link>
          <Link to='/friends'>Friends</Link>
          <Link to='/activities'>Activities</Link>
        </div>
        <div>
          {!authenticated && <Link to='/register'>Register</Link>}
          {!authenticated && <Link to='/login'>Login</Link>}
          {authenticated && <NavDropdown username={username} handleLogout={this.handleLogout}/>}
        </div>
      </nav>
    )
  }
}
export default withRouter(Navbar)

const NavDropdown = ({ username, handleLogout }) => (
  <div className='dropdown nav-menu'>
    <div className='dropdown-trigger'>{username}</div>
    <div className='dropdown-content'>
      <a onClick={handleLogout} className=''>Logout</a>
    </div>
  </div>
)
