import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'

export default class ExpensesSettleEdit extends React.Component {
  constructor() {
    super()

    this.state = {
      expense: null,
      errors: {}
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    axios.get(`/api/expenses/${this.props.match.params.id}`, { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(res => this.setState({ expense: res.data }))
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
    axios.put('/api/expenses', this.state.expense)
      .then(res => this.props.history.push(`/expenses/${res.data.id}`))
      .catch(err => {
        console.log('in error catch:', err.response)
        this.setState({ errors: err.response.data })
      })
  }

  render () {
    const { expense, errors } = this.state
    return (
      <section>
        <h1>Settlement Edit Page</h1>
        {expense &&
          <form onSubmit={this.onSubmit}>
            <div>
              <input id='amount' type='number' placeholder=' ' value={expense.amount} onChange={this.onChange} />
              <label htmlFor='amount'>Amount</label>
              {errors.amount && <div className='error-message'>{errors.amount}</div>}
            </div>
            <button type='submit'>Save</button>
          </form>
        }
      </section>

    )
  }
}
