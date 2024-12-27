import React from 'react';
import background from '../assets/backgrounds/main.png';
import '../styles.css';
import { useNavigate } from 'react-router-dom';
// import { Socket } from 'socket.io';

export default function Main() {
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
                </div>
            </div>
        </div>
    );
}
