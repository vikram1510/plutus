import React from 'react'
import axios from 'axios'
import auth from '../../lib/auth'

import Spinner from '../common/Spinner'
import ExpenseIndex from '../expenses/ExpensesIndex'
import amountHelper from '../../lib/amount'
import Dialog from '../common/Dialog'


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
    // return <Spinner />
    if (!this.state.friend) return <Spinner />
    const { friend } = this.state
    const friendAmountStr = `${amountHelper.getAmountString(friend.total)} £${friend.total.replace('-','')}`
    const friendAmountClass = amountHelper.getAmountClass(friend.total)
    return (
      <>

      <section>
        <div className="container friend-show">
          <figure className='placeholder-figure friend-show'>
            <img src={friend.profile_image}></img>
          </figure>
          <h1>{friend.username}</h1>
          <h3>{friend.email}</h3>
          <h2 className={friendAmountClass}>{friendAmountStr}</h2>
        </div>
        <ExpenseIndex
          filter={`?friend_id=${friend.id}`}
        />
      </section>
      </>
    )
  }
}

export default FriendShow
