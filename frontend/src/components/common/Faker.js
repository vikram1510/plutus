import faker from 'faker'
import React from 'react'

const Faker = () => {
  console.log(faker.internet)
  return (
    <>
      <h1>Business</h1>
      <div className='faker'>
        <img src={faker.image.business()}></img>
      </div>
      <h1>Abstract</h1>
      <div className='faker'>
        <img src={faker.image.abstract()}></img>
      </div>
      <h1>city</h1>
      <div className='faker'>
        <img src={faker.image.city()}></img>
      </div>
      <h1>nightlife</h1>
      <div className='faker'>
        <img src={faker.image.nightlife()}></img>
      </div>
      <h1>fashion</h1>
      <div className='faker'>
        <img src={faker.image.fashion()}></img>
      </div>
      <h1>technics</h1>
      <div className='faker'>
        <img src={faker.image.technics()}></img>
      </div>
      <h1>Internet</h1>
      <div className='faker'>
        <img src={faker.internet.avatar()}></img>
      </div>
      <h1>Nature</h1>
      <div className='faker'>
        <img src={faker.image.nature()}></img>
      </div>
    </>
  )
  
}

export default Faker
