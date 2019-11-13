import React from 'react'
import { Link, withRouter } from 'react-router-dom'

class Navbar extends React.Component {
  render() {
    return (
      <nav>
        <div>
          <Link to='/'>Home</Link>
        </div>
        <div>
          <Link to='/register'>Register</Link>
          <Link to='/login'>Login</Link>
        </div>
      </nav>
    )
  }
}

export default withRouter(Navbar)
