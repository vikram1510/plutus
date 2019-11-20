import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

export default class ExpenseActivityCard extends React.Component {
  /*
    This is handle the bit about rendering the expense specific record
    need to do some rendering calculation to add expense split details
  */

  // _GenerateOweAmount(expenseDetail, loggedInUser){
  //   const lentDetail = expenseDetail.lent_detail

  //   const detail = {}
  //   // detail.payer = lentDetail.payer.username === loggedInUser.username ? 'You' : lentDetail.payer.username

  //   const isUserPayer = lentDetail.payer.username === loggedInUser.username

  //   // filter the debtors without the payer
  //   const debtors = lentDetail.debtors.filter(debtor => debtor.id !== lentDetail.payer.id )

  //   let oweAmount

  //   const isSettlement = expenseDetail.split_type === 'settlement'
  //   if (isUserPayer){
  //     detail.what = (isSettlement) ? 'paid' : 'get back'
  //     oweAmount = `£${lentDetail.split_total_exclude_payer}`
  //   } else {
  //     // then u must pay back
  //     detail.what = (isSettlement) ? 'received' : 'owe'
  //     const debtor = debtors.filter(debtor => debtor.username === loggedInUser.username)[0]
  //     if (debtor) oweAmount = `£${debtor.amount}`
  //     else oweAmount = 'None' // probably because the split person must have been deleted!
  //   }

  //   detail.oweAmount = oweAmount

  //   return detail
  // }

  generateOweAmount(expense, currentUser) {
    const { payer, debtors } = expense.lent_detail
    const isSettlement = expense.split_type === 'settlement'
    const detail = {}

    if (payer.id === currentUser.sub) {
      detail.verb = (isSettlement) ? 'paid' : 'get back'
      detail.amount = expense.lent_detail.split_total_exclude_payer
    } else {
      const debtor = debtors.find(debtor => debtor.id === currentUser.sub)

      detail.verb = (isSettlement) ? 'received' : 'owe'
      detail.amount = (debtor) ? debtor.amount : 'None'
    }

    return detail
  }

  render() {
    const { activity, user } = this.props

    const linkTo = `expenses/${activity.record_ref}`

    // what did the user do: add, update or delete
    let action = activity.activity_type
    if (action === 'created') action = 'added'

    // this is the date of this activity
    const dateCreated = `${moment(activity.date_created).fromNow()} (${moment(activity.date_created).format('MMM DD HH:mm:ss')})`
    const activityOwner = user.username === activity.creator.username ? 'You' : activity.creator.username

    const expenseDetail = activity.activity_detail

    const expenseDescription = expenseDetail.description

    // const oweDetail = this.generateOweAmount(expenseDetail, user)
    const { verb, amount } = this.generateOweAmount(expenseDetail, user)
    // green if the current user is expected to recieve money, organge if current user needs to pay
    const oweAmountClass = ['owe', 'paid'].includes(verb) ? 'expense-debit' : 'expense-credit'


    let additionalClass = ''
    const isDeleted = action === 'deleted'
    if (action === 'deleted') additionalClass = 'expense-deleted'


    return (
      <Link to={linkTo} className='expense-item'>
        <figure className='activity-figure'>
          <i className="fas fa-edit fa-3x"/>
        </figure>
        <div className='summary-div'>
          <div>
            <b>{activityOwner}</b> {action} &quot;<strong>{expenseDescription}</strong>&quot;
            <div className={oweAmountClass}>
              <div className={action === 'deleted' ? 'activity-deleted' : ''}>
                <strong>You</strong> {verb} <strong>£{amount}</strong>
              </div>
            </div>
          </div>
          <div>&nbsp;</div>
          <div>{dateCreated}</div>
        </div>
      </Link>)
  }
}
