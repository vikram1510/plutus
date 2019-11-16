import React from 'react'
import { Link } from 'react-router-dom'

const ListCard = ({ linkTo, name, description = '', action = '', amount = '' }) => (
  <Link to={linkTo} className='expense-item'>
    <figure className='placeholder-figure'></figure>
    <div className='summary-div'>
      <div>{name}</div>
      <div>{description}</div>
    </div>
    <div className='lent-div'>
      <div>{action}</div>
      <div>{amount}</div>
    </div>
  </Link>
)

export default ListCard
