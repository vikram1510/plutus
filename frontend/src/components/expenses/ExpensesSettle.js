import React from 'react'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import Auth from '../../lib/auth'
import amountHelper from '../../lib/amount'

import Spinner from '../common/Spinner'
import PayPal from '../common/PayPayButton'


class ExpensesSettle extends React.Component {

  constructor() {
    super()

    this.state = {
      friend: null,
      amount: ''
    }

    // the maximum allowed pay to be made which should not exceed the amount that the payer owes
    this.maxAmount = 0
    this.amountString = ''

    // this is the direction of pay
    this.userPays = true

    this.onChange = this.onChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

  }

  componentDidMount() {

    const { friend } = this.props

    this.setState({ friend: friend, amount: friend.total.replace('-', '') })
    this.maxAmount = Number(friend.total.replace('-', ''))
    this.amountString = amountHelper.getAmountString(friend.total)
  }


  onChange({ target: { value } }) {
    this.setState({ amount: value })
  }


  handleSubmit(e) {

    e.preventDefault()

    const payload = Auth.getPayload()

    const { amount, friend } = this.state

    const userSplit = { amount: 0, debtor: { id: payload.sub } }
    const friendSplit = { amount: 0, debtor: { id: friend.id } }
    
    let payerId
    if (this.amountString === 'owes you') {

      userSplit.amount = amount
      payerId = friend.id
    } else {
      friendSplit.amount = amount
      payerId = payload.sub
    }

    // for debugging
    const data = {
      creator: { id: payload.sub },
      payer: { id: payerId },
      amount,
      description: 'Settle payment',
      split_type: 'settlement',
      splits: [
        userSplit,
        friendSplit
      ]
    }

    console.log('data: ', data)

    axios.post('/api/expenses', data, { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(() => this.props.history.go(-1))
      .catch(err => console.log(err))
  }


  render() {

    const { friend } = this.state
    if (!friend) return <Spinner/>

    const displayUserOnRight = this.amountString === 'owes you'
    
    return (
      <section>
        <div className='settlement-container friend-show'>
          <div className='settle-payment'>
            <div>
              <figure className='placeholder-figure friend-show'>
                <img src={displayUserOnRight ? friend.profile_image : Auth.getPayload().profile_image}></img>
              </figure>
              <h2>{displayUserOnRight ? friend.username : Auth.getPayload().username}</h2>
            </div>
            <div>
              <i className="fas fa-chevron-circle-right fa-5x"></i>
              {/* <i className="far fa-paper-plane fa-5x"></i> */}
            </div>
            <div>
              <figure className='placeholder-figure friend-show'>
                <img src={displayUserOnRight ? Auth.getPayload().profile_image : friend.profile_image}></img>
              </figure>
              <h2>{displayUserOnRight ? Auth.getPayload().username : friend.username}</h2>
            </div>

          </div>

          <form className='settlement-form' onSubmit={this.handleSubmit}>
            <div className='input-save'>
              <div>
                <input id='amount' type='number' placeholder=' ' value={this.state.amount} max={this.maxAmount} onChange={this.onChange} />
                <label htmlFor='amount'>Amount</label>
              </div>

              <button>Save</button>
            </div>
            <div>
              <PayPal/>
            </div>

          </form>
        </div>

      </section>
    )
  }

}

export default withRouter(ExpensesSettle)
