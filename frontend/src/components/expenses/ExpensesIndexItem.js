import React from 'react'

const lentAmount = (amount, splits) => (
  amount - splits.reduce((sum, split) => sum + Number(split.amount), 0)
)

const ExpensesIndexItem = ({ payer, amount, splits, description }) => (
  <div className='expense-item'>
    <figure className='placeholder-figure'>
      <div></div>
    </figure>
    <div className='summary-div'>
      <div>{description}</div>
      <div>{payer.username} paid £{amount}</div>
    </div>
    <div className='lent-div'>
      <div>{payer.username} lent</div>
      <div>£{lentAmount(amount, splits)}</div>
    </div>
  </div>
)

export default ExpensesIndexItem
