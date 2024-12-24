    import React, { useState } from 'react'
    import background from '../assets/backgrounds/main.png'
    import { characterStats } from '../model/characters'
    import { useLocation } from 'react-router-dom';
    import '../styles.css'
    export default function Ready() {
        const [charIndex, setCharIndex] = useState(1);
        const [warning, setWarning] = useState(false)
        const [name, setName] = useState("")
        const [kills, setKills] = useState(5)
        const [imgsrc, setImgsrc] = useState(`assets/Characters/${characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].name}/${characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].name}.png`)
        // console.log(characterStats[charIndex][Object.keys(characterStats[0])[0]]);
        const location = useLocation();
        const { owner } = location.state || {};
        
        function handleLeftArrow(){
            if(charIndex ===0){
                setCharIndex(characterStats.length - 1)
            }
            else{
                setCharIndex(charIndex -1)
            }
            setImgsrc(`assets/Characters/${characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].name}/${characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].name}.png`)
        
        }


        function handleRightArrow(){
            setCharIndex((charIndex + 1 ) % characterStats.length)
            setImgsrc(`assets/Characters/${characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].name}/${characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].name}.png`)
        }

        function handleJoin(){
            if(!name){
                setWarning(true)
            }
        }
        return (
            <div className='main'>
                <img src={background} className='background' />
                <div className='container'>
                    <h1 className='main-title'>FALLEN</h1>
                    <h1 className='main-title'>GUNS</h1>
                    <div className='options'>
                        <div className='inputs'>
                            <input className='textinput' type='text' placeholder='Enter Name' value={name} onChange={(e)=>setName(e.target.value)}></input>
                            {owner &&
                            <div className='deaths'>
                                Max Kills:<input type='number' min={5} value={kills} onChange={(e)=>{setKills(e.target.value)}}></input>
                            </div>
                            }
                        </div>
                        <div className='char'>
                            <div className='pic'>
                                <div className='arrow left' onClick={handleLeftArrow}>&lt;</div>
                                <img src={imgsrc} alt='haha'/>
                                <div className='arrow left' onClick={handleRightArrow}>&gt;</div>
                            </div>
                            <div className='stats'>
                            <p>❤️Health:{characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].health}</p>
                            <p>⏱️Bullet Time:{characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].bulletTime}</p>
                            <p>🔫Ammo:{characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].ammo}</p>
                            <p>💥Damage:{characterStats[charIndex][Object.keys(characterStats[charIndex])[0]].damage}</p>
                            </div>
                        </div>
                        <button className='my-button'onClick={handleJoin}>Join</button>
                        {warning && <p className='warning'>Please enter name</p>}
                    </div>
                </div>
            </div>
        )
    }
