import React from 'react'
import axios from 'axios'
import auth from '../../lib/auth'
import FriendCard from '../expenses/ListCard'

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
        <FriendCard
          key={user.id}
          linkTo='/'
          name={'Total Balance'}
          description={`${user.total < 0 ? 'You owe' : 'You are owed'} 
                        ${'£' + user.total.replace('-','')}`}
        >
        </FriendCard>
        <div className="container">
          {friends.map(friend => (
            <FriendCard
              key={friend.id}
              linkTo={`/friends/${friend.id}`}
              name={friend.username}
              action={friend.total < 0 ? 'you owe' : 'owes you'}
              amount={'£' + friend.total.replace('-','')}
            >
            </FriendCard>
          ))}
        </div>
      </section>

    )
  }


}

export default FriendsIndex
