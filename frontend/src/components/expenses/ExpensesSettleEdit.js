import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'

export default class ExpensesSettleEdit extends React.Component {
  constructor() {
    super()

    this.state = {
      expense: null,
      errors: {},
      payer: null,
      ower: null
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    axios.get(`/api/expenses/${this.props.match.params.id}`, { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(res => {
        const splitPayer = res.data.splits.find(split => split.debtor.id === res.data.payer.id)
        const splitOwer = res.data.splits.find(split => split.debtor.id !== res.data.payer.id)
        this.setState({ expense: res.data, ower: splitOwer.debtor, payer: splitPayer.debtor })
      })
      .catch(err => console.log(err))
  }

  onChange({ target: { id, value } }) {
    const splits = this.state.expense.splits.map(split => {
      if (split.debtor.id !== this.state.expense.payer.id) split.amount = value
      return split
    })
    const expense = { ...this.state.expense, splits, [id]: value }
    const errors = { ...this.state.errors, [id]: '' }

    this.setState({ expense, errors })
  }

  onSubmit(e) {
    e.preventDefault()
    console.log(this.state.expense)
    axios.put(`/api/expenses/${this.props.match.params.id}`, this.state.expense, { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(() => this.props.history.go(-1))
      .catch(err => {
        console.log('in error catch:', err.response)
        this.setState({ errors: err.response.data })
      })
  }

  render () {
    const { expense, errors, ower, payer } = this.state
    return (
      <section>
        {expense &&
          <div className='settlement-container friend-show'>
            <h1>Edit settlement</h1>

            <div className='settle-payment'>
              <div>
                <figure className='placeholder-figure friend-show'>
                  <img src={payer.profile_image}></img>
                </figure>
                <h2>{payer.username}</h2>
              </div>
              <div>
                <i className="fas fa-chevron-circle-right fa-5x"></i>
              </div>
              <div>
                <figure className='placeholder-figure friend-show'>
                  <img src={ower.profile_image}></img>
                </figure>
                <h2>{ower.username}</h2>
              </div>
            </div>

            <form onSubmit={this.onSubmit}>
              <div>
                <input id='amount' type='number' placeholder=' ' value={expense.amount} onChange={this.onChange} />
                <label htmlFor='amount'>Amount</label>
                {errors.amount && <div className='error-message'>{errors.amount}</div>}
              </div>
              <button type='submit'>Save</button>
            </form>
          </div>
        }
      </section>

    )
  }
}
