import React from 'react'
import axios from 'axios'
import auth from '../../lib/auth'
import UserCard from './UserCard'

import Spinner from '../common/Spinner'
import Dialog from '../common/Dialog'

import amountHelper from '../../lib/amount'

const AddFriendDialog = ( { email, onSubmit, onChange, error } ) => {
  return (
    <div className="add-friend-dialog">
      <h2>Add Friend</h2>
      <form onSubmit={(e) => onSubmit(e)}>
        <div>
          <input id='username' placeholder=' ' onChange={(e) => onChange(e)} value={email}/>
          <label htmlFor='username'>Email</label>
          <div className='error-message'>{error ? error : ''}</div>
        </div>
        <button  className="add-buton">Add</button>
      </form>
    </div>
  )
}

const FoundFriendDialog = ({ friend, addFriend }) => {
  return (
    <div className="found-friend-dialog">
      <div className="user">
        <figure className='placeholder-figure'>
          <img src={friend.profile_image}></img>
        </figure>
        <h2>{friend.username}</h2>
      </div>
      <button onClick={() => addFriend(friend)}>Add</button>
    </div>
  )
}

const InviteDialog = ({ email, sendInvite, success, pending }) => {
  return (
    <div className="invite-dialog">
      <h1>User Not Found</h1>
      <h2>This person does not have a Plutus account, Send them an invite!</h2>
      <div className="invite">
        <p>{email}</p>
        <button 
          className={success ? 'invite-success animated tada' : ''}
          onClick={() => sendInvite()}
          disabled={success}
        >
          {success ? 
          <><span>Sent</span><i className="fas fa-check"></i></> : 
            pending ? 
              <i className="fas fa-spinner fa-spin"></i> : 'Send Invite'
          }
        </button>
      </div>
    </div>
  )
}

class FriendsIndex extends React.Component {

  constructor(){
    super()
    this.state = {
      totals: null,
      refresh: false,
      friendDialog: false,
      foundFriendDialog: false,
      inviteDialog: false,
      friendEmail: '',
      foundUser: null,
      invalidEmailError: '',
      inviteSuccess: false,
      invitePending: true
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.addFriend = this.addFriend.bind(this)
    this.sendInvite = this.sendInvite.bind(this)
  }


  onChange(e){
    this.setState({ friendEmail: e.target.value, invalidEmailError: '' })
  }

  onSubmit(e){
    e.preventDefault()
    axios.get('/api/users?email=' + this.state.friendEmail, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then((res) => {
        this.setState({ foundUser: res.data[0] }, () => {
          this.closeDialogs()
          if (this.state.foundUser) {
            this.setState( { foundFriendDialog: true } )
          } else {
            this.setState( { inviteDialog: true })
          }
        })
      })
      .catch((err) => this.setState({ invalidEmailError: err.response.data[0] }))
  }

  addFriend(friend){
    axios.post('/api/friends', friend, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(() => {
        this.closeDialogs()
        this.getTotals()
      })
  }

  sendInvite(){
    this.setState({ invitePending: true }, () => {
      axios.post('/api/invites', { email: this.state.friendEmail }, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
        .then(() => {
          this.setState({ inviteSuccess: true, invitePending: false })
        })
        .catch((err) => console.log(err.response.data))
    })
  }
  componentDidMount(){
    this.getTotals()
  }

  getTotals(){
    this.setState({ refresh: true })
    axios.get('/api/totals', { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(res =>  {
        this.setState({ totals: res.data, refresh: false })

      })
      .catch(err => console.log(err.response.data) )
  }

  closeDialogs(){
    this.setState({ friendDialog: false, foundFriendDialog: false, inviteDialog: false, inviteSuccess: false, invitePending: false })
  }

  

  render(){
    if (!this.state.totals) return <Spinner />
    const friends = this.state.totals.friends
    const user = this.state.totals.user
    return (
      <section>
        <Dialog
          open={this.state.friendDialog || this.state.foundFriendDialog || this.state.inviteDialog}
          closeFunction={(e) => this.closeDialogs(e)}
        >
          {this.state.friendDialog &&
          <AddFriendDialog
            email={this.state.friendEmail}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
            error={this.state.invalidEmailError}
          />
          }
          {this.state.foundFriendDialog &&
          <FoundFriendDialog
            friend={this.state.foundUser}
            addFriend={this.addFriend}
          />}
          {this.state.inviteDialog &&
          <InviteDialog
            email={this.state.friendEmail}
            sendInvite={this.sendInvite}
            success={this.state.inviteSuccess}
            pending={this.state.invitePending}
          />}
        </Dialog>
        
        <div className="user-card">
          <UserCard
            key={user.id}
            linkTo='/friends'
            name={'Total Balance'}
            amountClass={amountHelper.getAmountClass(user.total)}
            description={`${user.total < 0 ? 'You owe' : 'You are owed'} 
                        ${'£' + user.total.replace('-','')}`}
            profileImage={user.profile_image}
            refresh={this.state.refresh}
            className='user'
          />
          <div><button className="refresh" onClick={() => this.getTotals()}>
            <i className={`fas fa-sync-alt ${this.state.refresh ? 'fa-spin' : ''}`}></i>
          </button></div>
          <div><button className="add-friend" onClick={() => this.setState({ friendDialog: true })}>
            <i className="fas fa-plus"></i>
          </button></div>
        </div>
        <div className="container">
          {friends.map(friend => (
            <UserCard
              key={friend.id}
              linkTo={`/friends/${friend.id}`}
              name={friend.username}
              action={amountHelper.getAmountString(friend.total)}
              amount={Number(friend.total) === 0 ? '' : ' £' + friend.total.replace('-','')}
              amountClass={amountHelper.getAmountClass(friend.total)}
              profileImage={friend.profile_image}
              refresh={this.state.refresh}
            />
          ))}
        </div>
        {/* <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
        </div> */}
      </section>

    )
  }


}

export default FriendsIndex
