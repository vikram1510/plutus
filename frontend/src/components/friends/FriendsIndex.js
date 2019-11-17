import React from 'react'
import axios from 'axios'
import auth from '../../lib/auth'
import UserCard from './UserCard'

import amountHelper from '../../lib/amount'

class FriendsIndex extends React.Component {

  constructor(){
    super()
    this.state = {
      totals: null
    }
  }

  componentDidMount(){
    axios.get('/api/totals', { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(res =>  this.setState({ totals: res.data }))
      .catch(err => console.log(err.response.data) )
  }

  render(){
    if (!this.state.totals) return null
    const friends = this.state.totals.friends
    const user = this.state.totals.user
    return (
      <section>
        <UserCard
          key={user.id}
          linkTo='/'
          name={'Total Balance'}
          amountClass={amountHelper.getAmountClass(user.total)}
          description={`${user.total < 0 ? 'You owe' : 'You are owed'} 
                        ${'£' + user.total.replace('-','')}`}
          profileImage={user.profile_image}
        >
        </UserCard>
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
            >
            </UserCard>
          ))}
        </div>
      </section>

    )
  }


}

export default FriendsIndex
