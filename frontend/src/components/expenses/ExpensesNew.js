import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'
import ExpensesForm from './ExpensesForm'

const payload = Auth.getPayload()

export default class ExpensesNew extends React.Component {
  constructor() {
    super()

    this.state = {
      friends: null,
      data: {
        creator: {
          id: payload.sub
        },
        payer: {
          id: payload.sub
        },
        split_type: 'equal',
        splits: []
      },
      debtors: {},
      errors: {}
    }

    this.onChange = this.onChange.bind(this)
    this.onSplitChange = this.onSplitChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount() {
    axios.get('/api/friends', { headers: { Authorization: `Bearer ${Auth.getToken()}` } })
      .then(res => this.setState({ friends: [{ id: payload.sub, username: payload.username }, ...res.data] }))
      .catch(err => console.log(err))
  }

  onChange({ target: { id, value } }) {
    if (id === 'payer') value = { id: value }

    const data = { ...this.state.data, [id]: value }
    const debtors = (id === 'split_type') ? {} : this.state.debtors
    const errors = { ...this.state.errors, [id]: '' }

    this.setState({ data, debtors, errors })
  }

  onSplitChange({ target: { id, value, checked } }) {
    const debtor = (value > 0 || checked) ? { amount: value, debtor: { id } } : null
    const debtors = { ...this.state.debtors, [id]: debtor }
    this.setState({ debtors })
  }

  getSplits() {
    const { data, debtors } = this.state
    let splits = Object.values(debtors).filter(split => split)

    switch (data.split_type) {
      case 'equal':
        splits =  splits.map(split => ({ ...split, amount: data.amount / splits.length }))
        break
      case 'unequal':
        break
      case 'percentage':
        splits = splits.map(split => ({ ...split, amount: split.amount / 100 * data.amount }))
        break
      default:
        console.log('unexpected split_type')
        break
    }

    const payerIncluded = splits.find(split => split.debtor.id === data.payer.id)
    return payerIncluded ? splits : [{ amount: 0, debtor: data.payer }, ...splits]
  }

  onSubmit(e) {
    e.preventDefault()

    const splits = this.getSplits()
    const data = { ...this.state.data, splits }

    axios.post('/api/expenses', data)
      .then(res => this.props.history.push(`/expenses/${res.data.id}`))
      .catch(err => this.setState({ errors: err.response.data }))
  }

  render() {
    const { data, friends, errors } = this.state
    return (
      <section>
        <h1>Add Expense</h1>
        <ExpensesForm
          data={data}
          friends={friends}
          errors={errors}
          onChange={this.onChange}
          onSubmit={this.onSubmit}
          onSplitChange={this.onSplitChange}
        />
      </section>
    )
  }
}
