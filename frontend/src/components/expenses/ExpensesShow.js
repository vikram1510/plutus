import React from 'react'
import axios from 'axios'
import moment from 'moment'
import Auth from '../../lib/auth'

export default class ExpensesShow extends React.Component {
  constructor() {
    super()

    this.state = {
      expense: null,
      data: null,
      errors: {}
    }

    this.onChange = this.onChange.bind(this)
    this.submitComment = this.submitComment.bind(this)
  }

  componentDidMount() {
    this.getExpense()
  }

  getExpense() {
    axios.get(`/api/expenses/${this.props.match.params.id}`)
      .then(res => this.setState({ expense: res.data }))
      .catch(err => console.log(err))
  }

  onChange({ target: { id, value } }) {
    const data = { ...this.state.data, [id]: value }
    const errors = { ...this.state.errors, [id]: '' }
    this.setState({ data, errors })
  }

  submitComment(e) {
    e.preventDefault()

    const creator = Auth.getPayload().sub
    const expense = this.props.match.params.id
    const data = { ...this.state.data, creator, expense  }

    axios.post(`/api/expenses/${expense}/comments`, data)
      .then(() => this.getExpense())
      .catch(err => this.setState({ errors: err.response.data }))
  }

  render() {
    const { expense, errors } = this.state
    return expense &&
      <section>
        <div className='expense-header'>
          <div>
            <button onClick={() => this.props.history.go(-1)}>«</button>
            <figure className='placeholder-figure'></figure>
          </div>
          <div>
            <h3>{expense.description}</h3>
            <h2>£{expense.amount}</h2>
            <p>Added by {expense.creator.username} on {moment(expense.date_created).format('LL')}</p>
          </div>
          <button onClick={() => alert('edit function not yet implemented')}>Edit</button>
        </div>
        <div className='expense-splits'>
          <p>SPLIT DETAILS</p>
          {expense.splits.map(split => (
            <div key={split.id}>
              <figure className='placeholder-figure circle'></figure>
              <p><span>{split.debtor.username}</span> owes <span>£{split.amount}</span></p>
            </div>
          ))}
        </div>
        <div className='expense-comment-form'>
          <form onSubmit={this.submitComment}>
            <div>
              <input id='text' placeholder=' ' onChange={this.onChange}/>
              <label htmlFor='text'>Comment</label>
              {errors.text && <div className='error-message'>{errors.text}</div>}
            </div>
            <button type='submit'>Add Comment</button>
          </form>
        </div>
        <div className='expense-comments'>
          {expense.comments && expense.comments.map(({ id, creator, text }) => (
            <div key={id} className='comment'>
              <figure className='placeholder-figure circle'></figure>
              <div>
                <p className='username'>{creator.username}</p>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
  }
}
