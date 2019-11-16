import React from 'react'
import axios from 'axios'
import ExpensesIndexItem from './ExpensesIndexItem'
import auth from '../../lib/auth'

export default class ExpensesIndex extends React.Component {
  constructor() {
    super()

    this.state = {
      expenses: null
    }
  }

  componentDidMount() {
    const filter = this.props.filter ? this.props.filter : ''
    axios.get('/api/expenses' + filter, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(res => this.setState({ expenses: res.data }))
      .catch(err => console.log(err))
  }

  render() {
    const { expenses } = this.state
    // const userTotal = exp
    return (
      <section>
        <h1>This be Expenses Index</h1>
        <div className='container'>
          {expenses && expenses.map(expense => {
            const userId = auth.getPayload().sub
            const userIsPayer = expense.payer.id ===  userId
            const userSplit = expense.splits.filter(split => split.debtor.id === userId)
            const userDebtAmount = userSplit[0].amount
            expense.userAmount = `£${userIsPayer ? (Number(expense.amount) - Number(userDebtAmount)).toFixed(2) : userDebtAmount}`
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
