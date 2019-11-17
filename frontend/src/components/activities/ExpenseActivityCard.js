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
    detail.payer = lentDetail.payer.username === loggedInUser.username ? 'You' : lentDetail.payer.username

    // filter the debtors without the payer
    const debtors = lentDetail.debtors.filter(debtor => debtor.id !== lentDetail.payer.id )

    let oweAmount
    let what

    if (detail.payer === 'You'){
      what = 'get back'
      oweAmount = lentDetail.split_total_exclude_payer

    } else {
      // then u must pay back
      what = 'owe'
      oweAmount = debtors.filter(debtor => debtor.username === loggedInUser.username)[0].amount
    }

    detail.what = what
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
    const who = user.username === activity.creator.username ? 'You' : activity.creator.username

    const expenseDetail = activity.activity_detail

    const expenseDescription = expenseDetail.description

    const oweDetail = this.generateOweAmount(expenseDetail, user)

    // green if the current user is expected to recieve money, organge if current user needs to pay
    const oweAmountClass = oweDetail.payer === 'You' ? 'expense-credit' : 'expense-debit'

    return (
      <Link to={linkTo} className='expense-item'>
        <figure className='placeholder-figure'></figure>
        <div className='summary-div'>
          <div>
            <b>{who}</b> {action} &quot;<strong>{expenseDescription}</strong>&quot;
            <div className={oweAmountClass}>
              <b>{oweDetail.payer}</b> {oweDetail.what} <strong>£{oweDetail.oweAmount}</strong>
            </div>
          </div>
          <div>&nbsp;</div>
          <div>{dateCreated}</div>
        </div>
      </Link>)
  }
}
