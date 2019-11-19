import React from 'react'

const Dialog = ( { open = false , children, closeFunction } ) => {

  return (
    open && (
      <div id="wrapper" onClick={(e) => {
        if (e.target.id === 'wrapper' || e.target.id === 'close' ) closeFunction(e)
      }} className="dialog-wrapper">
        <div className="dialog-component container">
          <div className="close">
            <i id="close" className="fas fa-times-circle"></i>
          </div>
          {children}
        </div>
      </div>
    )
  )


}

export default Dialog
