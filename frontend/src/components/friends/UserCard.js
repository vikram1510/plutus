import React from 'react'
import { Link } from 'react-router-dom'

const ListCard = ({ linkTo, name, amountClass, description = '', action = '', amount = '', profileImage, refresh }) => (
  <Link to={linkTo} className='expense-item'>
    <figure className='placeholder-figure'>
      <img src={profileImage}></img>
    </figure>
    <div className='user-div'>
      <div>{name}</div>
      <div className={`${amountClass} ${refresh ? 'hidden' : ''}`}>{description}</div>
    </div>
    {!refresh && 
    <div className={`lent-div ${amountClass}`}>
      <div>{action}</div>
      <div>{amount}</div>
    </div>
    }
  </Link>
)

export default ListCard
