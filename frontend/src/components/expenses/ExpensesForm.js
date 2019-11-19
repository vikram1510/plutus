// import React from 'react'

// const ExpensesForm = ({ data, debtors, friends, errors, onChange, onSubmit, onSplitChange, buttonText }) => {
//   return (
//     <form onSubmit={onSubmit}>
//       <div>
//         <input id='description' placeholder=' ' value={data.description} onChange={onChange} />
//         <label htmlFor='description'>Description</label>
//         {errors.description && <div className='error-message'>{errors.description}</div>}
//       </div>
//       <div>
//         <input id='amount' type='number' placeholder=' ' value={data.amount} onChange={onChange} />
//         <label htmlFor='amount'>Amount</label>
//         {errors.amount && <div className='error-message'>{errors.amount}</div>}
//       </div>
//       <div className='select-wrapper'>
//         <p>Payer</p>
//         <select id='payer' value={data.payer.id} onChange={onChange}>
//           {friends && friends.map(({ id, username }) => (
//             <option key={id} value={id}>{username}</option>
//           ))}
//         </select>
//       </div>
//       <div className='select-wrapper'>
//         <p>Splits</p>
//         <select id='split_type' value={data.split_type} onChange={onChange}>
//           <option value='equal'>Equal</option>
//           <option value='unequal'>Unequal</option>
//           <option value='percentage'>Percentage</option>
//         </select>
//       </div>
//       <div>
//         {friends && friends.map(({ id, username }) => (
//           <div key={id} className='debtor-wrapper'>
//             <label htmlFor={id} className='debtor'>{username}</label>
//             <div>
//               <div>{data.split_type === 'unequal' ? '£' : data.split_type === 'percentage' ? '%' : null}</div>
//               <input
//                 id={id}
//                 type={data.split_type === 'equal' ? 'checkbox' : 'number'}
//                 placeholder='0'
//                 value={debtors[id] && debtors[id].amount}
//                 checked={debtors[id] && debtors[id].amount > 0}
//                 onChange={onSplitChange}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//       <button type='submit'>{buttonText}</button>
//     </form>
//   )
// }

// export default ExpensesForm
