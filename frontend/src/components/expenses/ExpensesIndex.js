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
