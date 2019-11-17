import React from 'react'
import axios from 'axios'
import ExpensesIndexItem from './ExpensesIndexItem'
import auth from '../../lib/auth'
import { Link } from 'react-router-dom'

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
        <Link to='/expenses/new'>
          <button>Create</button>
        </Link>
        <div className='container'>
          {expenses && expenses.map(expense => (
            <ExpensesIndexItem key={expense.id} {...expense}/>
          ))}
        </div>
      </section>
    )
  }
}
