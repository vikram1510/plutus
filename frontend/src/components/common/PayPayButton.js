import { PayPalButton } from 'react-paypal-button-v2'
import React from 'react'
 

const PayPal = () => {
  const style = {
    color: 'blue',
    shape: 'pill',
    label: 'pay',
    height: 40,
    layout: 'horizontal'
  }
  return (
    <PayPalButton
      amount='0.01'
      clientId='sb'
      style={style}
      onSuccess={() => {
        alert('Not implemented!!')
      }}
    />
  )
}

export default PayPal


