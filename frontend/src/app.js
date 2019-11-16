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

import FriendsIndex from './components/friends/FriendsIndex'
import FriendShow from './components/friends/FriendShow'

const App = () => (
  <BrowserRouter>
    <>
      <Navbar />
      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/register' component={Register} />
        <Route path='/login' component={Login} />
        <Route path='/expenses/:id' component={ExpensesShow} />
        <Route path='/expenses' component={ExpensesIndex} />
        <Route path='/friends/:id' component={FriendShow} />
        <Route path='/friends' component={FriendsIndex} />
      </Switch>
    </>
  </BrowserRouter>
)

ReactDom.render(<App />, document.getElementById('root'))
