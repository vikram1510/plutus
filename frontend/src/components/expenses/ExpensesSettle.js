import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'

import Spinner from '../common/Spinner'
import PayPal from '../common/PayPayButton'


export default class ExpensesSettle extends React.Component {

  constructor() {
    super()

    this.state = {
      friend: null,
      amount: '',
      renderPayPal: false
    }

    // the maximum allowed pay to be made which should not exceed the amount that the payer owes
    this.maxAmount = 0

    this.onChange = this.onChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

  }

  componentDidMount() {

    const { friend } = this.props

    this.setState({ friend: friend, amount: friend.total, renderPayPal: true })
    this.maxAmount = friend.total
  }


  onChange({ target: { value } }) {
    this.setState({ amount: value })
  }


  handleSubmit(e) {

    e.preventDefault()

    const payload = Auth.getPayload()

    const { amount, friend } = this.state

    axios.post('/api/expenses', {
      creator: {
        id: payload.sub
      },
      payer: {
        id: payload.sub
      },
      amount: amount,
      description: 'Settlement payment',
      split_type: 'settlement',
      splits: [
        {
          // the payer who is the same as the logged in user - set the amount as zero - the amount they owe
          amount: 0,
          debtor: {
            id: payload.sub
          }
        },
        {
          // the amount the payer paid so that this guy is 'owed' the amount
          amount,
          debtor: {
            id: friend.id
          }
        }
      ]
    }, { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(() => this.props.history.push('/expenses'))
      .catch(err => this.setState({ errors: err.response.data }))

  }

  renderPayPal(){
    window['loadPayPalBtn']()
    // window['hello']()
    // window.loadPayPalBtn()
  }


  render() {

    const { friend } = this.state
    if (!friend) return <Spinner/>
    
    return (
      <section>
        <div className="container friend-show">
          <figure className='placeholder-figure friend-show'>
            <img src={friend.profile_image}></img>
          </figure>
          <h1>{friend.username}</h1>
          <h2>{friend.email}</h2>

          <form className='settlement-form' onSubmit={this.handleSubmit}>
            <div className='input-save'>
              <div>
                <input id='amount' placeholder=' ' value={this.state.amount} max={this.maxAmount} onChange={this.onChange} />
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
