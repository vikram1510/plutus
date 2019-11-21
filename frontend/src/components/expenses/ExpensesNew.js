import React from 'react'
import axios from 'axios'
import Auth from '../../lib/auth'

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
        splits =  splits.map(split => ({ ...split, amount: (data.amount / splits.length).toFixed(2) }))
        break
      case 'unequal':
        break
      case 'percentage':
        splits = splits.map(split => ({ ...split, amount: (split.amount / 100 * data.amount).toFixed(2) }))
        break
      default:
        console.log('unexpected split_type')
        break
    }

    // Add the £0.01 rounding error back
    const sum = splits.reduce((sum, split) => sum + Number(split.amount), 0)
    splits[0].amount = Number(splits[0].amount) + (data.amount - sum)

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
        <form onSubmit={this.onSubmit}>
          <div>
            <input id='description' placeholder=' ' onChange={this.onChange} />
            <label htmlFor='description'>Description</label>
            {errors.description && <div className='error-message'>{errors.description}</div>}
          </div>
          <div>
            <input id='amount' type='number' placeholder=' ' onChange={this.onChange} />
            <label htmlFor='amount'>Amount</label>
            {errors.amount && <div className='error-message'>{errors.amount}</div>}
          </div>
          <div className='select-wrapper'>
            <p>Payer</p>
            <select id='payer' value={data.payer.id} onChange={this.onChange}>
              {friends && friends.map(({ id, username }) => (
                <option key={id} value={id}>{username}</option>
              ))}
            </select>
          </div>
          <div className='select-wrapper'>
            <p>Splits</p>
            <select id='split_type' value={data.split_type} onChange={this.onChange}>
              <option value='equal'>Equal</option>
              <option value='unequal'>Unequal</option>
              <option value='percentage'>Percentage</option>
            </select>
          </div>
          <div>
            {friends && friends.map(({ id, username }) => (
              <div key={id} className='debtor-wrapper'>
                <label htmlFor={id} className='debtor'>{username}</label>
                <div>
                  <div>{data.split_type === 'unequal' ? '£' : data.split_type === 'percentage' ? '%' : null}</div>
                  <input id={id} type={data.split_type === 'equal' ? 'checkbox' : 'number'} placeholder='0' onChange={this.onSplitChange} />
                </div>
              </div>
            ))}
          </div>
          <button type='submit'>Create</button>
        </form>
      </section>
    )
  }
}
