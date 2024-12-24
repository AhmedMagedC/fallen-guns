import React from 'react'
import background from '../assets/backgrounds/main.png'
import '../styles.css'
export default function Join() {
    return (
        <div className='main'>
            <img src={background} className='background' />
            <div className='container'>
                <h1 className='main-title'>FALLEN</h1>
                <h1 className='main-title'>GUNS</h1>
                <div className='ui'>
                    <input className='textinput' placeholder='Enter Room Id'></input>
                    <button className='my-button'>Join Room</button>
                </div>
            </div>
        </div>
    )
}
