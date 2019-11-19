import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

export default class ExpenseActivityCard extends React.Component {
  /*
    This is handle the bit about rendering the expense specific record
    need to do some rendering calculation to add expense split details
  */

  generateOweAmount(expenseDetail, loggedInUser){

    const lentDetail = expenseDetail.lent_detail

    const detail = {}
    // detail.payer = lentDetail.payer.username === loggedInUser.username ? 'You' : lentDetail.payer.username

    const isUserPayer = lentDetail.payer.username === loggedInUser.username
    detail.expensePayer = lentDetail.payer.username

    // filter the debtors without the payer
    const debtors = lentDetail.debtors.filter(debtor => debtor.id !== lentDetail.payer.id )

    let oweAmount

    if (isUserPayer){
      detail.what = 'get back'
      oweAmount = `£${lentDetail.split_total_exclude_payer}`

    } else {
      // then u must pay back
      detail.what = 'owe'
      const debtor = debtors.filter(debtor => debtor.username === loggedInUser.username)[0]
      if (debtor) oweAmount = `£${debtor.amount}`
      else oweAmount = 'None' // probably because the split person must have been deleted!

    }

    detail.oweAmount = oweAmount

    return detail
  }

  render() {
    const { activity, user } = this.props

    const linkTo = `expenses/${activity.record_ref}`

    // what did the user do: add, update or delete
    let action = activity.activity_type
    if (action === 'created') action = 'added'

    // this is the date of this activity
    const dateCreated = `${moment(activity.date_created).fromNow()} (${moment(activity.date_created).format('MMM DD hh:mm:ss')})`
    const activityOwner = user.username === activity.creator.username ? 'You' : activity.creator.username

    const expenseDetail = activity.activity_detail

    const expenseDescription = expenseDetail.description

    const oweDetail = this.generateOweAmount(expenseDetail, user)

    // green if the current user is expected to recieve money, organge if current user needs to pay
    const oweAmountClass = oweDetail.what === 'owe' ? 'expense-debit' : 'expense-credit'


    let additionalClass = ''
    if (action === 'deleted') additionalClass = 'expense-deleted'

    return (
      <Link to={linkTo} className={`expense-item ${additionalClass}`}>
        <figure className='activity-figure'>
          <i className="fas fa-edit fa-3x"/>
        </figure>
        <div className='summary-div'>
          <div>
            <b>{activityOwner}</b> {action} &quot;<strong>{expenseDescription}</strong>&quot;
            <div className={oweAmountClass}>
              <strong>You</strong> {oweDetail.what} <strong>{oweDetail.oweAmount}</strong>
            </div>
          </div>
          <div>&nbsp;</div>
          <div>{dateCreated}</div>
        </div>
      </Link>)
  }
}
