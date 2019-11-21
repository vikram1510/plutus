import React from 'react'
import Notify from './Notify'
import { Link } from 'react-router-dom'
import Auth from '../../lib/auth'

export default class Home extends React.Component {

  componentDidMount(){
    if (Auth.isAuthenticated()) this.props.history.push('/friends')
  }
  render() {
    return (
      <>
        <div className="home-page">
          <p className="animated bounceInLeft">Split that bill!</p>
          <div className="home-page-contents">
            <div className="main-logo-div">
              <img src="../../assets/images/main-logo.png"></img>
            </div>
            <div className="auth-buttons">
              <Link to="/register"><button className="sign-up">Sign Up</button></Link>
              <Link to="/login"><button className="log-in">Log In</button></Link>
            </div>
          </div>

        </div>
        {/* <Notify /> */}
      </>
    )
  }
}
