import React from 'react'
import Notify from './Notify'

export default class Home extends React.Component {
  render() {
    return (
      <>
        <div className="home-page">
          <p className="animated bounceInLeft">Split that fucking bill!</p>
          <div className="home-page-contents">
            <div className="main-logo-div">
              <img src="../../assets/images/main-logo.png"></img>
            </div>
            <div className="auth-buttons">
              <button className="sign-up">Sign Up</button>
              <button className="log-in">Log In</button>
            </div>
          </div>

        </div>
        {/* <Notify /> */}
      </>
    )
  }
}
