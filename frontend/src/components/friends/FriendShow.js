import React from 'react'
import axios from 'axios'
import auth from '../../lib/auth'

import ExpenseIndex from '../expenses/ExpensesIndex'

class FriendShow extends React.Component {

  constructor(){
    super()
    this.state = {
      friend: null,
      expenses: null
    }
  }

  componentDidMount(){
    const friendId = this.props.match.params.id
    axios(`/api/totals?friend_id=${friendId}`, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(res => this.setState({ friend: res.data }))
      .catch(err => console.log(err.response.data))
  }

  render(){
    if (!this.state.friend) return null
    const { friend } = this.state
    return (
      <section>
        <div className="container">
          <figure className='placeholder-figure'></figure>
          <h1>{friend.username}</h1>
          <h3>{friend.email}</h3>
          <h2>{`${friend.total < 0 ? 'You owe' : 'owes you'} 
                        ${'£' + friend.total.replace('-','')}`}</h2>
        </div>
        <ExpenseIndex
          filter={`?friend_id=${friend.id}`}
        />
      </section>
    )
  }
}

export default FriendShow
