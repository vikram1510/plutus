import React from 'react'
import axios from 'axios'
import auth from '../../lib/auth'
import UserCard from './UserCard'
import Spinner from '../common/Spinner'

import amountHelper from '../../lib/amount'

class FriendsIndex extends React.Component {

  constructor(){
    super()
    this.state = {
      totals: null,
      refresh: false
    }
  }

  componentDidMount(){
    this.getTotals()
  }

  getTotals(){
    this.setState({ refresh: true })
    axios.get('/api/totals', { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(res =>  {
        this.setState({ totals: res.data, refresh: false })

      })
      .catch(err => console.log(err.response.data) )
  }

  render(){
    if (!this.state.totals) return <Spinner />
    const friends = this.state.totals.friends
    const user = this.state.totals.user
    return (
      <section>
        <div className="user-card">
          <UserCard
            key={user.id}
            linkTo='/'
            name={'Total Balance'}
            amountClass={amountHelper.getAmountClass(user.total)}
            description={`${user.total < 0 ? 'You owe' : 'You are owed'} 
                        ${'£' + user.total.replace('-','')}`}
            profileImage={user.profile_image}
            refresh={this.state.refresh}
          />
          <div><button onClick={() => this.getTotals()}>
            <i className={`fas fa-sync-alt ${this.state.refresh ? 'fa-spin' : ''}`}></i>
          </button></div>
        </div>
        <div className="container">
          {friends.map(friend => (
            <UserCard
              key={friend.id}
              linkTo={`/friends/${friend.id}`}
              name={friend.username}
              action={amountHelper.getAmountString(friend.total)}
              amount={Number(friend.total) === 0 ? '' : ' £' + friend.total.replace('-','')}
              amountClass={amountHelper.getAmountClass(friend.total)}
              profileImage={friend.profile_image}
              refresh={this.state.refresh}
            />
          ))}
        </div>
        {/* <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
        </div> */}
      </section>

    )
  }


}

export default FriendsIndex
