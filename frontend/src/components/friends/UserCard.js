import React from 'react'
import { Link } from 'react-router-dom'

const ListCard = ({ linkTo, name, amountClass, description = '', action = '', amount = '' }) => (
  <Link to={linkTo} className='expense-item'>
    <figure className='placeholder-figure'></figure>
    <div className='balance-div'>
      <div>{name}</div>
      <div className={amountClass}>{description}</div>
    </div>
    <div className={`lent-div ${amountClass}`}>
      <div>{action}</div>
      <div>{amount}</div>
    </div>
  </Link>
)

export default ListCard
