const axios = require('axios')
const faker = require('faker')
const atob = require('atob')

const users = [
  {
    username: 'admin',
    email: 'admin@email.com',
    password: 'admin',
    password_confirmation: 'admin',
    is_superuser: true,
    is_staff: true,
    profile_image: faker.image.avatar()
  },
  {
    username: 'rakesh',
    email: 'rakesh@email.com',
    password: 'admin',
    password_confirmation: 'admin',
    is_superuser: true,
    is_staff: true,
    profile_image: faker.image.avatar()
  },
  {
    username: 'buklau',
    email: 'buklau@email.com',
    password: 'admin',
    password_confirmation: 'admin',
    is_superuser: true,
    is_staff: true,
    profile_image: faker.image.avatar()
  },
  {
    username: 'tyler',
    email: 'tyler@email.com',
    password: 'admin',
    password_confirmation: 'admin',
    is_superuser: true,
    is_staff: true,
    profile_image: faker.image.avatar()
  }
]

users.forEach( user => {
  axios.post('http://localhost:8000/api/register', user)
    .then(res => console.log(res.data))
    .catch(err => console.log(err.response.data))
})

setTimeout(() => {
  users.forEach( (user,i) => {
    axios.post('http://localhost:8000/api/login', { email: user.email, password: user.password })
      .then(res => {
        const token = res.data.token
        users[i].token = token
        const parts = token.split('.')
        users[i].id = JSON.parse(atob(parts[1])).sub
      })
      .catch(err => console.log('ERROR1', err.response.data))
  })
}, 1000)

setTimeout(() => {
  if (users.some(user => !user.token)){
    console.log('something went wrong lol')
  } else {
    console.log('USERS CREATED')
  }
}, 2000)


setTimeout(() => {
  const expenses = [
    {
      'creator': {
        'id': users[0].id,
        'username': users[0].username
      },
      'payer': {
        'id': users[0].id,
        'username': users[0].username
      },
      'amount': '20.00',
      'description': 'bottle expense',
      'split_type': 'equal',
      'splits': [
        {
          'amount': '5.00',
          'debtor': {
            'id': users[0].id,
            'username': users[0].username
          }
        },
        {
          'amount': '5.00',
          'debtor': {
            'id': users[1].id,
            'username': users[1].username
          }
        },
        {
          'amount': '5.00',
          'debtor': {
            'id': users[2].id,
            'username': users[2].username
          }
        },
        {
          'amount': '5.00',
          'debtor': {
            'id': users[3].id,
            'username': users[3].username
          }
        }
      ]
    },
    {
      'creator': {
        'id': users[1].id,
        'username': users[1].username
      },
      'payer': {
        'id': users[1].id,
        'username': users[1].username
      },
      'amount': '18.00',
      'description': 'Poutine',
      'split_type': 'equal',
      'splits': [
        {
          'amount': '6.00',
          'debtor': {
            'id': users[1].id,
            'username': users[1].username
          }
        },
        {
          'amount': '6.00',
          'debtor': {
            'id': users[2].id,
            'username': users[2].username
          }
        },
        {
          'amount': '6.00',
          'debtor': {
            'id': users[3].id,
            'username': users[3].username
          }
        }
      ]
    }
  ]
  expenses.forEach( expense => {
    axios.post('http://localhost:8000/api/expenses', expense)
      .then(() => console.log('EXPENSE CREATED'))
      .catch((err) => console.log(err.response.data))
  })
},3000)
