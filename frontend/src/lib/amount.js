export default class amountHelper {
  static getAmountString(amountDecimal){
    const amount = Number(amountDecimal)

    if (amount === 0){
      return 'settled up'
    } else if (amount > 0){
      return 'owes you'
    } else {
      return 'you owe'
    }

  }

  static getAmountClass(amountDecimal){
    const amount = Number(amountDecimal)

    if (amount === 0){
      return 'expense-settled'
    } else if (amount > 0){
      return 'expense-credit'
    } else {
      return 'expense-debit'
    }

  }


}
