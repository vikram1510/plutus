import React from 'react'
import ExpenseActivityCard from './ExpenseActivityCard'
import CommentActivityCard from './CommentActivityCard'

const ActivityListCard = ({ activity, user }) => {

  if (activity.model_name === 'Expense') {
    return <ExpenseActivityCard activity={activity} user={user}/>

  } else if (activity.model_name === 'Comment') {
    return <CommentActivityCard activity={activity} user={user}/>
  }

  // return null for any model_name that is not supported yet
  return null
}

export default ActivityListCard
