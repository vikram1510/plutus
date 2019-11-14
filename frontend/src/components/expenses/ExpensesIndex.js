import React from 'react'
import axios from 'axios'
import ExpensesIndexItem from './ExpensesIndexItem'

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
    return (
      <section>
        <h1>This be Expenses Index</h1>
        <div className='container'>
          {expenses && expenses.map(expense => (
            <ExpensesIndexItem key={expense.id} {...expense}/>
          ))}
        </div>
      </section>
    )
  }
}
