import React from 'react'

const Dialog = ( { open = false , children, closeFunction } ) => {

  return (
    open && (
      <div className="dialog-wrapper">
        <div className="dialog-component container">
          <div className="close">
            <i className="fas fa-times-circle" onClick={(e) => closeFunction(e)}></i>
          </div>
          {children}
        </div>
      </div>
    )
  )


}

export default Dialog
