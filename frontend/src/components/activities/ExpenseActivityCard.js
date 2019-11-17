import React from 'react'
import { Link } from 'react-router-dom'

const ExpenseActivityCard = ({ activity, user }) => {
  /*
    This is handle the bit about rendering the expense specific record
  */

  let linkTo
  let action // what did the user do: add, update or delete
  const item = activity.activity_detail.description
  let additionalDetail = ''

  if (activity.model_name === 'Expense') {
    linkTo = `expenses/${activity.record_ref}`
    action = activity.activity_type
    if (action === 'created') action = 'added'


  } else if (activity.model_name === 'Comment') {
    linkTo = `expenses/${activity.activity_detail.expense_id}`
    action = 'commented on'
    additionalDetail = `: "${activity.activity_detail.text}"`
  }

  const who = user.username === activity.creator.username ? 'You' : activity.creator.username

  return (
    <Link to={linkTo} className='expense-item'>
      <figure className='placeholder-figure'></figure>
      <div className='summary-div'>
        <div><b>{who}</b> {action} &quot;<strong>{item}</strong>&quot;{additionalDetail}</div>
        <div>&nbsp;</div>
      </div>
    </Link>
  )
}

export default ExpenseActivityCard
