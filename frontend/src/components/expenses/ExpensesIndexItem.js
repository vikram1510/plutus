import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import Auth from '../../lib/auth'
import coin from '../../assets/images/coin-logo.png'

const ExpensesIndexItem = ({ id, payer, amount, description, ...rest }) => {

  const dateCreated = moment(rest.data_created).format('MMM DD')
  const deleted = rest.is_deleted
  const { userAmount, amountClass, userAction  } = rest
  return (
    <Link to={`/expenses/${id}`} className={`expense-item ${deleted ? 'expense-deleted' : ''}`}>
      <div className="expense-date">{dateCreated}</div>
      <figure className='placeholder-figure'>
        {rest.split_type === 'settlement' ? <img src={coin}></img> : <i className="fas fa-money-check-alt"></i>}
      </figure>
      {rest.split_type === 'settlement' &&
        <div className='summary-div'>
          <div>{payer.username} paid {rest.splits.find(split => split.amount > 0).debtor.username} £{amount}</div>
          <div></div>
        </div>
      }
      {rest.split_type !== 'settlement' &&
        <>
          <div className='summary-div'>
            <div>{description}</div>
            <div>{payer.id === Auth.getPayload().sub ? 'you' : payer.username} paid £{amount}</div>
          </div>
          <div className={`lent-div ${amountClass}`}>
            <div>{userAction}</div>
            <div>{userAmount}</div>
          </div>
        </>
      }
    </Link>
  )
}

export default ExpensesIndexItem
