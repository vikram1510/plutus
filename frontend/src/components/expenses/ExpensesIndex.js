import React from 'react'
import axios from 'axios'

export default class ExpensesIndex extends React.Component {
  constructor() {
    super()

    this.state = {
      expenses: null
    }
  }

  componentDidMount() {
    axios.get('/api/expenses')
      .then(res => this.setState({ expenses: res.data }))
      .catch(err => console.log(err))
  }

  render() {
    const { expenses } = this.state
    console.log(expenses)
    return (
      <section>
        <h1>This be Expenses Index</h1>
        <div>
          {expenses && expenses.map(expense => {
            const payer = expense.payer.username
            const lentAmount = expense.amount - expense.splits.reduce((sum, split) => sum + Number(split.amount), 0)
            return (
              <div key={expense.id}>
                <div>
                  <h4>{expense.description}</h4>
                  <div>{payer} paid £{expense.amount}</div>
                </div>
                <div>
                  <h5>{payer} lent</h5>
                  <div>£{lentAmount}</div>
                </div>
                <hr></hr>
              </div>
            )
          })}
        </div>
      </section>
    )
  }
}
