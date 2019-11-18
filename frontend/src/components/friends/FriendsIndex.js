import React from 'react'
import axios from 'axios'
import auth from '../../lib/auth'
import UserCard from './UserCard'

import Spinner from '../common/Spinner'
import Dialog from '../common/Dialog'

import amountHelper from '../../lib/amount'

const AddFriendDialog = ( { email, onSubmit, onChange } ) => {
  return (
    <div className="add-friend-dialog">
      <h2>Add Friend</h2>
      <form onSubmit={(e) => onSubmit(e)}>
        <div>
          <input id='username' placeholder=' ' onChange={(e) => onChange(e)} value={email}/>
          <label htmlFor='username'>Email</label>
          <div className='error-message'>Error</div>
          {/* {errors.username && <div className='error-message'>{errors.username}</div>} */}
        </div>
        <button  className="add-buton">Add</button>
      </form>
    </div>
  )
}

const FoundFriendDialog = ({ friend, addFriend }) => {
  return (
    <div className="found-friend-dialog">
      <figure className='placeholder-figure'>
        <img src={friend.profile_image}></img>
      </figure>
      <h2>{friend.username}</h2>
      <button onClick={() => addFriend(friend)}>Add</button>
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
      friendEmail: '',
      foundUser: null
    }

    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.addFriend = this.addFriend.bind(this)
  }


  onChange(e){
    this.setState({ friendEmail: e.target.value })
  }

  onSubmit(e){
    e.preventDefault()
    axios.get('/api/users?email=' + this.state.friendEmail)
      .then((res) => {
        this.setState({ foundUser: res.data[0] }, () => {
          this.closeDialogs()
          if (this.state.foundUser) {
            this.setState( { foundFriendDialog: true } )
          }
        })
      })
  }

  addFriend(friend){
    axios.post('/api/friends', friend, { headers: { Authorization: `Bearer ${auth.getToken()}` } })
      .then(() => {
        this.closeDialogs()
        this.getTotals()
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
    this.setState({ friendDialog: false, foundFriendDialog: false })
  }

  

  render(){
    if (!this.state.totals) return <Spinner />
    const friends = this.state.totals.friends
    const user = this.state.totals.user
    return (
      <section>
        <Dialog
          open={this.state.friendDialog || this.state.foundFriendDialog}
          closeFunction={() => this.closeDialogs()}
        >
          {this.state.friendDialog &&
          <AddFriendDialog
            email={this.state.friendEmail}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
          />
          }
          {this.state.foundFriendDialog &&
          <FoundFriendDialog
            friend={this.state.foundUser}
            addFriend={this.addFriend}
          />
          }
            

        </Dialog>
        <div className="user-card">
          <UserCard
            key={user.id}
            linkTo='/'
            name={'Total Balance'}
            amountClass={amountHelper.getAmountClass(user.total)}
            description={`${user.total < 0 ? 'You owe' : 'You are owed'} 
                        ${'£' + user.total.replace('-','')}`}
            profileImage={user.profile_image}
            refresh={this.state.refresh}
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
