import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

const CommentActivityCard = ({ activity, user }) => {
  /*
    This will be responsible for rendering the comment activity
  */


  const commentDetail = activity.activity_detail

  const linkTo = `expenses/${activity.activity_detail.expense_id}`
  const action = 'commented on'
  const dateCreated = `${moment(activity.date_created).fromNow()} (${moment(activity.date_created).format('MMM DD hh:mm:ss')})`
  

  const who = user.username === activity.creator.username ? 'You' : activity.creator.username

  return (
    <Link to={linkTo} className='expense-item'>
      <figure className='activity-figure'>
        <i className="fas fa-comment-dots fa-3x"/>
      </figure>
      <div className='summary-div'>
        <div><b>{who}</b> {action} &quot;<strong>{commentDetail.expense_description}</strong>&quot;: &quot;{commentDetail.text}&quot;</div>
        <div>&nbsp;</div>
        <div>{dateCreated}</div>
      </div>
    </Link>
  )
}

export default CommentActivityCard
