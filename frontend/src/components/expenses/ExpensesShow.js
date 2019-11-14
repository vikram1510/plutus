import React from 'react'
import axios from 'axios'
import moment from 'moment'

const placeholderComments = [
  {
    username: 'user1',
    comment: 'dummy comment 1'
  },
  {
    username: 'user2',
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  },
  {
    username: 'user1',
    comment: 'dummy comment 3'
  },
  {
    username: 'user1',
    comment: 'dummy comment 4'
  },
  {
    username: 'user1',
    comment: 'dummy comment 5'
  },
  {
    username: 'user1',
    comment: 'dummy comment 6'
  }
]

export default class ExpensesShow extends React.Component {
  constructor() {
    super()

    this.state = {
      expense: null
    }
  }

  componentDidMount() {
    axios.get(`/api/expenses/${this.props.match.params.id}`)
      .then(res => this.setState({ expense: res.data }))
      .catch(err => console.log(err))
  }

  render() {
    const { expense } = this.state
    console.log(expense)
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
        <div className='expense-comments'>
          <p>COMMENTS</p>
          <form>
            <div>
              <input id='exp-comment' placeholder=' '/>
              <label htmlFor='exp-comment'>Add a Comment</label>
            </div>
            <button type='submit'>Add Comment</button>
          </form>
          <div className='comments'>
            {placeholderComments && placeholderComments.map(({ username, comment }) => (
              <div key={username + comment} className='comment'>
                <figure className='placeholder-figure circle'></figure>
                <div>
                  <p className='username'>{username}</p>
                  <p>{comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  }
}
