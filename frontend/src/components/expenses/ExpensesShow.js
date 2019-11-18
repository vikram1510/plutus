import React from 'react'
import axios from 'axios'
import moment from 'moment'
import Auth from '../../lib/auth'

import Spinner from '../common/Spinner'
import Dialog from '../common/Dialog'

const YesCancelDialog = ({ onYes, onCancel, message }) => (
  <div className="delete-dialog">
    <h3>{message}</h3>
    <div className="options">
      <button onClick={() => onYes()}className="yes">Yes</button>
      <button onClick={() => onCancel()}className="cancel">Cancel</button>
    </div>
  </div>
)

export default class ExpensesShow extends React.Component {
  constructor() {
    super()

    this.state = {
      expense: null,
      data: null,
      errors: {},
      deleteDialog: false,
      restoreDialog: false
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

  expenseDelete(value){
    const expense = this.state.expense
    this.setState({ expense: null }, () => {
      expense.is_deleted = value
      axios.put(`/api/expenses/${this.props.match.params.id}`, expense)
        .then(() => this.setState({ expense }, this.closeDialog))
        .catch(err => console.log(err.response.data))
    })
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

  closeDialog(){
    this.setState({ deleteDialog: false, restoreDialog: false })
  }

  render() {
    if (!this.state.expense) return <Spinner />
    const { expense, errors } = this.state
    return expense &&
    <>
    <Dialog 
      open={this.state.deleteDialog || this.state.restoreDialog}
      closeFunction={() => this.closeDialog()}
    >
      {
        this.state.deleteDialog &&
        <YesCancelDialog
          onYes={() => this.expenseDelete(true)}
          onCancel={() => this.closeDialog()}
          message='Are you sure?'
        />
      }
      {
        this.state.restoreDialog &&
        <YesCancelDialog
          onYes={() => this.expenseDelete(false)}
          onCancel={() => this.closeDialog()}
          message='Restore Expense?'
        />
      }
    </Dialog>
      <section className={expense.is_deleted ? 'expense-deleted' : ''}>
        <div className={`expense-header ${expense.is_deleted ? 'expense-deleted' : ''}`}>
          <div>
            <button onClick={() => this.props.history.go(-1)}>«</button>
            <figure className='placeholder-figure'></figure>
          </div>
          <div>
            <p className="expense-timestamp">Created by {expense.creator.username} on {moment(expense.date_created).format('LL')}</p>
            <h3>{expense.description}</h3>
            <h2>£{expense.amount}</h2>
            <h3>Paid by {expense.payer.username}</h3>
            
          </div>
          <button><i className="fas fa-pen"></i></button>
          {!expense.is_deleted ?
            <button className="delete" onClick={() => this.setState({ deleteDialog: true })}>
              <i className="fas fa-trash-alt"></i>
            </button> :
            <button className="restore" onClick={() => this.setState({ restoreDialog: true })}>
              <i className="fas fa-trash-restore"></i>
            </button>
          }
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
            <button disabled={expense.is_deleted} type='submit'>Add Comment</button>
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
    </>
  }
}
