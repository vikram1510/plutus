import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

const ExpensesIndexItem = ({ id, payer, amount, splits, description, ...rest }) => {
  
  const dateCreated = moment(rest.data_created).format('MMM DD')
  const { userAmount, amountClass, userAction  } = rest
  return (
    <Link to={`/expenses/${id}`} className='expense-item'>
      <div className="expense-date">{dateCreated}</div>
      <figure className='placeholder-figure'></figure>
      <div className='summary-div'>
        <div>{description}</div>
        <div>{payer.username} paid £{amount}</div>
      </div>
      <div className={`lent-div ${amountClass}`}>
        <div>{userAction}</div>
        <div>{userAmount}</div>
      </div>
    </Link>
  )
}

export default ExpensesIndexItem
