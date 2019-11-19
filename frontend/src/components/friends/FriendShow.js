import React from 'react'
import { Link } from 'react-router-dom'
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

      deleteDialog: false,
      restoreDialog: false
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
    this.setState({ restoreDialog: true })
  }

  render(){
    if (!this.state.friend) return <Spinner />
    const { friend } = this.state
    
    const friendAmountStr = `${amountHelper.getAmountString(friend.total)} £${friend.total.replace('-','')}`
    const friendAmountClass = amountHelper.getAmountClass(friend.total)
    return (
      <>
      <Dialog open={this.state.deleteDialog || this.state.restoreDialog}
        closeFunction={() => this.setState({ deleteDialog: false, restoreDialog: false })}>

        <ExpenseSettle
          friend={this.state.friend}
        />
      </Dialog>
      <section>
        <div className="container friend-show">
          <figure className='placeholder-figure friend-show'>
            <img src={friend.profile_image}></img>
          </figure>
          <h1>{friend.username}</h1>
          <h2>{friend.email}</h2>
          <h2 className={friendAmountClass}>{friendAmountStr}</h2>
          
          <button onClick={this.openSettle}>Settle up</button>
          
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
