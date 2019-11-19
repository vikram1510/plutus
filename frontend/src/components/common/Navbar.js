import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import Auth from '../../lib/auth'
import Pusher from 'pusher-js'
import axios from 'axios'

class Navbar extends React.Component {
  constructor() {
    super()

    this.state = {
      friendsClass: '',
      notificationClass: '',
      expenseClass: '',
      notifications: 0
    }

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout() {
    Auth.logout()
    this.props.history.push('/')
  }

  componentDidMount(){
    this.setSelectedNavbarItem()
    const pusher = new Pusher(process.env.PUSHER_APP_KEY, {
      cluster: 'eu',
      forceTLS: true
    })

    // each user subscribes to their channel to listen of events
    const channel = pusher.subscribe(Auth.getPayload().email)
    channel.bind('update', data => {
      if (data.creator.id !== Auth.getPayload().sub) {
        this.setState({ notifications: this.state.notifications + 1 })
      }
    })
  }

  componentDidUpdate(prevProps){
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setSelectedNavbarItem()
    }
  }

  setSelectedNavbarItem(){
    const pathname = this.props.location.pathname
    this.setState({ friendsClass: '', expenseClass: '', notificationClass: '' }, () => {
      if (pathname === '/friends'){
        this.setState({ friendsClass: 'navbar-item-selected' })
      } else if (pathname === '/expenses/new') {
        this.setState({ expenseClass: 'navbar-item-selected' })
      } else if (pathname === '/activities') {
        this.setState({ notificationClass: 'navbar-item-selected', notifications: 0 })
      }
    })

  }
  render() {
    const authenticated = Auth.isAuthenticated()
    const profileImage = Auth.getPayload().profile_image
    console.log('notifications', typeof this.state.notifications)
    return (
      Auth.isAuthenticated() ?
        <nav>
          <div>
            <Link className={this.state.friendsClass} to='/friends'>
              <div className="navbar-item">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </div>
            </Link>
            <Link className={this.state.expenseClass} to='/expenses/new'>
              <div className="navbar-item">
                <div className="coin-logo">
                  <img src="../../assets/images/coin-logo.png"></img>
                </div>
                <span>Add Expense</span>
              </div>
            </Link>
            <Link className={this.state.notificationClass} to='/activities'>
              <div className="navbar-item nav-notification">
                <i className="fas fa-bell"></i>
                <span>Notifications</span>
                {this.state.notifications !== 0 && <span className="number">{this.state.notifications}</span>}
              </div>
            </Link>
          </div>
          <div>
            {authenticated && <NavDropdown profileImage={profileImage} handleLogout={this.handleLogout}/>}
          </div>
        </nav> :
        <nav className="not-logged-in">
          <div className="coin-logo animated rollIn">
            <img className="fa-spin" src="../../assets/images/coin-logo.png"></img>
          </div>
          <h1>PLUTUS</h1>
        </nav>
    )
  }
}
export default withRouter(Navbar)

const NavDropdown = ({ profileImage, handleLogout }) => (
  <div className='dropdown nav-menu'>
    <div className='dropdown-trigger'>
      <figure className='placeholder-figure'>
        <img src={profileImage}></img>
      </figure></div>
    <div className='dropdown-content'>
      <a onClick={handleLogout} className="logout">Logout</a>
    </div>
  </div>
)
