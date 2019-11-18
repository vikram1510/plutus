import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import Auth from '../../lib/auth'

const ExpensesIndexItem = ({ id, payer, amount, description, ...rest }) => {
  
  const dateCreated = moment(rest.data_created).format('MMM DD')
  const deleted = rest.is_deleted
  const { userAmount, amountClass, userAction  } = rest
  return (
    <Link to={`/expenses/${id}`} className={`expense-item ${deleted ? 'expense-deleted' : ''}`}>
      <div className="expense-date">{dateCreated}</div>
      <figure className='placeholder-figure'>
        {/* <i className="fas fa-money-bill-wave"></i> */}
        <i className="fas fa-money-check-alt"></i>
      </figure>
      <div className='summary-div'>
        <div>{description}</div>
        <div>{payer.id === Auth.getPayload().sub ? 'you' : payer.username} paid £{amount}</div>
      </div>
      <div className={`lent-div ${amountClass}`}>
        <div>{userAction}</div>
        <div>{userAmount}</div>
      </div>
    </Link>
  )
}

export default ExpensesIndexItem
