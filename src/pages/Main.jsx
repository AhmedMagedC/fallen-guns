import React, { useState } from 'react';
import background from '../assets/backgrounds/main.png';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
// import { Socket } from 'socket.io';

export default function Main() {
    const [instructions, setInstructions] = useState(false);

    // const socket = io()
    const navigate = useNavigate();
    function handleClick(owner) {
        navigate('/ready', { state: { owner } });
    }

    return (
        <div className='main'>
            <img src={background} className='background' />
            <div className='container'>
                <h1 className='main-title'>FALLEN</h1>
                <h1 className='main-title'>GUNS</h1>
                <div className='ui'>
                    <button className='my-button' onClick={() => handleClick(true)}>Create Room</button>
                    <button className='my-button' onClick={() => handleClick(false)}>Join Room</button>
                    <button className='my-button small' onClick={()=>{setInstructions(true)}}>💡 How To Play</button>
                </div>
            </div>
            {instructions && <div className='instructions'>
                <div className='instructions-box'>
                    <h2>How To Play</h2>
                    <span onClick={()=>{setInstructions(false)}}>X</span>
                    <ul>
                        <li>
                            right arrow: to move right
                        </li>
                        <li>
                            left arrow: to move left
                        </li>
                        <li>
                            up arrow: to jump/double jump
                        </li>
                        <li>
                            f: to shoot/hit
                        </li>
                        <li>
                            tab: for scoreboard
                        </li>
                        <li>
                            ammo crates: replenish ammo
                        </li>
                    </ul>
                </div>
            </div>}
        </div>
    );
}
