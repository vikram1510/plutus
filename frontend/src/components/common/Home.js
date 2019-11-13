import React from 'react'
import Notify from './Notify'

export default class Home extends React.Component {
  render() {
    return (
      <>
        <h1>This be Home page</h1>
        <Notify />
      </>
    )
  }
}
