import React from 'react'
import { Link } from 'react-router-dom'

const lentAmount = (amount, splits) => (
  amount - splits.reduce((sum, split) => sum + Number(split.amount), 0)
)

const ExpensesIndexItem = ({ id, payer, amount, splits, description }) => (
  <Link to={`/expenses/${id}`} className='expense-item'>
    <figure className='placeholder-figure'></figure>
    <div className='summary-div'>
      <div>{description}</div>
      <div>{payer.username} paid £{amount}</div>
    </div>
    <div className='lent-div'>
      <div>{payer.username} lent</div>
      <div>£{lentAmount(amount, splits)}</div>
    </div>
  </Link>
)

export default ExpensesIndexItem
