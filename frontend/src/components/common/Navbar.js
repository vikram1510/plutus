import React from 'react'
import { Link, withRouter } from 'react-router-dom'

class Navbar extends React.Component {
  render() {
    return (
      <nav>
        <Link to='/'>Home</Link>
        <Link to='/register'>Register</Link>
        <Link to='/login'>Login</Link>
      </nav>
    )
  }
}

export default withRouter(Navbar)
