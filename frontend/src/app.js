import React from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import './style.scss'

import Home from './components/common/Home'
import Navbar from './components/common/Navbar'
import Register from './components/auth/Register'
import Login from './components/auth/Login'

import ExpensesIndex from './components/expenses/ExpensesIndex'
import ExpensesShow from './components/expenses/ExpensesShow'
import ExpensesNew from './components/expenses/ExpensesNew'
import ExpensesEdit from './components/expenses/ExpensesEdit'
import ExpensesSettleEdit from './components/expenses/ExpensesSettleEdit'

import FriendsIndex from './components/friends/FriendsIndex'
import FriendShow from './components/friends/FriendShow'

import ActivityIndex from './components/activities/ActivityIndex'

const App = () => (
  <BrowserRouter>
    <>
      <Navbar />
      <main>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/register' component={Register} />
          <Route path='/login' component={Login} />
          <Route path='/expenses/new' component={ExpensesNew} />
          <Route path='/expenses/:id/edit' component={ExpensesEdit} />
          <Route path='/expenses/:id/settleedit' component={ExpensesSettleEdit} />
          <Route path='/expenses/:id' component={ExpensesShow} />
          <Route path='/expenses' component={ExpensesIndex} />
          <Route path='/friends/:id' component={FriendShow} />
          <Route path='/friends' component={FriendsIndex} />
          <Route path='/activities' component={ActivityIndex} />
        </Switch>
      </main>
    </>
  </BrowserRouter>
)

ReactDom.render(<App />, document.getElementById('root'))
