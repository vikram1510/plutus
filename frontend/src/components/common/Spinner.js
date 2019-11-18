import React from 'react'

const Spinner = ({ wrapper = true }) => (
  
  wrapper ? <div className="loading-wrapper">
    <div className="loading">
      <i className="fas fa-spinner fa-spin"></i>
    </div>
  </div>
    :
    <div className="loading">
      <i className="fas fa-spinner fa-spin"></i>
    </div>
)

export default Spinner
