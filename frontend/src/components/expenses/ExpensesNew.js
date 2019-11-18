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
    const header = {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`
      }
    }

    axios.get('/api/friends', header)
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

  onSubmit(e) {
    e.preventDefault()

    let splits = Object.values(this.state.debtors).filter(split => split)
    if (this.state.data.split_type === 'equal') splits = splits.map(split => {
      return { ...split, amount: this.state.data.amount / splits.length }
    })

    if (!splits.find(split => split.debtor.id === payload.sub)) {
      splits = [{ amount: 0, debtor: { id: payload.sub } }, ...splits]
    }

    const data = { ...this.state.data, splits }

    axios.post('/api/expenses', data)
      .then(res => this.props.history.push(`/expenses/${res.data.id}`))
      .catch(err => this.setState({ errors: err.response.data }))
  }

  render() {
    const { data, friends, debtors, errors } = this.state
    return (
      <section>
        <h1>This be Expenses New Page</h1>
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
          <div>
            <p>Payer</p>
            <select id='payer' value={data.payer.id} onChange={this.onChange}>
              <option value={payload.sub}>{payload.username} (you)</option>
              {friends && friends.map(({ id, username }) => (
                <option key={id} value={id}>{username}</option>
              ))}
            </select>
            {errors.payer && <div className='error-message'>{errors.payer}</div>}
          </div>
          <div>
            <p>Split Type</p>
            <select id='split_type' value={data.split_type} onChange={this.onChange}>
              <option value='percentage'>Percentage</option>
              <option value='equal'>Equal</option>
              <option value='unequal'>Unequal</option>
              <option value='full_amount'>Full Amount</option>
              <option value='settlement'>Settlement</option>
            </select>
            {errors.split_type && <div className='error-message'>{errors.split_type}</div>}
          </div>
          <div>
            {data.split_type}
          </div>
          <div>
            <p>Splits between:</p>
            {data.split_type === 'equal' && friends && friends.map(({ id, username }) => (
              <label key={id} className='debtor'>
                {username}
                <input id={id} type='checkbox' placeholder='0' onChange={this.onSplitChange}/>
              </label>
            ))}
            {data.split_type !== 'equal' && friends && friends.map(({ id, username }) => (
              <label key={id} className='debtor'>
                {username}
                <input id={id} type='number' placeholder='0' onChange={this.onSplitChange}/>
              </label>
            ))}
            Currently hard coded to always split equally
          </div>
          <button type='submit'>Create</button>
        </form>
      </section>
    )
  }
}
