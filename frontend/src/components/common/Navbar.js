import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import Auth from '../../lib/auth'
import Pusher from 'pusher-js'

class Navbar extends React.Component {
  constructor() {
    super()

    this.state = {
      friendsClass: '',
      notificationClass: '',
      expenseClass: '',
      notifications: 0,
      bellAnimate: false
    }

    this.handleLogout = this.handleLogout.bind(this)

    this.channel = null
    this.pusher = null
  }

  handleLogout() {
    Auth.logout()
    this.props.history.push('/')
  }

  componentWillUnmount() {
    this.unsubscribePusher()
  }

  subscribePusher(){
    if (Auth.isAuthenticated()){
      this.pusher = new Pusher(process.env.PUSHER_APP_KEY, {
        cluster: 'eu',
        forceTLS: true
      })
      this.channel = this.pusher.subscribe(Auth.getPayload().email)
      this.channel.bind('update', data => {
        if (data.creator.id !== Auth.getPayload().sub) {
          this.setState({
            notifications: this.state.notifications + 1,
            bellAnimate: true
          }, () => {
            setTimeout(() => this.setState({ bellAnimate: false }), 1000)
          })
        }
      })
    }
  }

  unsubscribePusher(){
    if (this.channel){
      this.channel.unbind()
      this.pusher.unsubscribe(this.channel)
      this.channel = null
      this.pusher = null
    }
  }

  componentDidMount(){
    this.setSelectedNavbarItem()
  }

  componentDidUpdate(prevProps){
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setSelectedNavbarItem()
      if (!this.channel){
        this.subscribePusher()
      } else {
        if (!Auth.isAuthenticated()){
          this.unsubscribePusher()
        }
      }
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
    return (
      Auth.isAuthenticated() ?
        <nav>
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
              <i className={`fas fa-bell ${this.state.bellAnimate ? 'animated swing' : ''}`}></i>
              <span>Notifications</span>
              {this.state.notifications !== 0 && <span className="number">{this.state.notifications}</span>}
            </div>
          </Link>
          {authenticated &&
              <NavDropdown profileImage={profileImage} handleLogout={this.handleLogout}/>
          }
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
        <img src={profileImage} />
      </figure>
    </div>
    <div className='dropdown-content'>
      <div>{Auth.getPayload().username}</div>
      <Link to='/expenses'>Expenses</Link>
      <a onClick={handleLogout}>Logout</a>
    </div>
  </div>
)
