import React from 'react'
import axios from 'axios'
import ExpensesIndexItem from './ExpensesIndexItem'
import auth from '../../lib/auth'
import { Link } from 'react-router-dom'
import Spinner from '../common/Spinner'

export default class ExpensesIndex extends React.Component {
  constructor() {
    super()

    this.state = {
      expenses: null
    }
  }

  componentDidMount() {
    const friendId = this.props.friendId ? this.props.friendId : auth.getPayload().sub
    axios.get(`/api/expenses?friend_id=${friendId}`, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(res => this.setState({ expenses: res.data }))
      .catch(err => console.log(err.response.data))
  }

  render() {
    if (!this.state.expenses) return <Spinner wrapper={false}/>
    const { expenses } = this.state
    // const userTotal = exp
    return (
      <section>
        <div className='container'>
          {expenses && expenses.map(expense => {
            const userId = auth.getPayload().sub
            const userIsPayer = expense.payer.id ===  userId
            const userSplit = expense.splits.find(split => {
              if (userIsPayer){
                const friendId = this.props.friendId
                return friendId ? split.debtor.id === friendId : split.debtor.id === userId
              } else {
                return split.debtor.id === userId
              }
            })
            const userDebtAmount = userSplit.amount
            expense.userAmount = '£' + userDebtAmount
            expense.amountClass = userIsPayer ? 'expense-credit' : 'expense-debit'
            expense.userAction = userIsPayer ? 'you lent' : 'you borrowed'
            return <ExpensesIndexItem key={expense.id} {...expense}/>
          }
          )}
        </div>
      </section>
    )
  }
}
