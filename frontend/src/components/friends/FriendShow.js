import React from 'react'
import axios from 'axios'

import Auth from '../../lib/auth'
import amountHelper from '../../lib/amount'

import Spinner from '../common/Spinner'
import Dialog from '../common/Dialog'

import ExpenseIndex from '../expenses/ExpensesIndex'
import ExpenseSettle from '../expenses/ExpensesSettle'

class FriendShow extends React.Component {

  constructor(){
    super()
    this.state = {
      friend: null,
      expenses: null,

      settlementDialog: false
    }

    this.openSettle = this.openSettle.bind(this)

  }

  componentDidMount(){
    const friendId = this.props.match.params.id
    axios(`/api/totals?friend_id=${friendId}`, { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(res => this.setState({ friend: res.data }))
      .catch(err => console.log(err.response.data))
  }

  openSettle(){
    this.setState({ settlementDialog: true })
  }

  render(){
    if (!this.state.friend) return <Spinner />
    const { friend } = this.state
    
    const friendTotal = friend.total
    const friendAmountStr = `${amountHelper.getAmountString(friendTotal)} £${friendTotal.replace('-','')}`
    const friendAmountClass = amountHelper.getAmountClass(friendTotal)
    return (
      <>
      <Dialog open={this.state.settlementDialog}
        closeFunction={() => this.setState({ settlementDialog: false })}>

        <ExpenseSettle friend={this.state.friend} />
      </Dialog>
      <section>
        <div className="container friend-show">
          <figure className='placeholder-figure friend-show'>
            <img src={friend.profile_image}></img>
          </figure>
          <h1>{friend.username}</h1>
          <h2>{friend.email}</h2>
          <h2 className={friendAmountClass}>{friendAmountStr}</h2>
          
          { amountHelper.getAmountString(friendTotal) !== 'settled up' && <button onClick={this.openSettle}>Settle up</button> }
          
        </div>
        <ExpenseIndex
          friendId={friend.id}
        />
      </section>
      </>
    )
  }
}

export default FriendShow
