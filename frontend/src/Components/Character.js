// frontend/src/components/Character.js
import React from 'react';
import heroImage from '../hero.png'; // Tečka navíc, protože jdeme o složku výš

function Character({ player }) {
  return (
    <div className="stats-card">
      <h2>Hrdina: {player.username}</h2>
      <img src={heroImage} alt="Hrdina" className="hero-avatar" />
      <p className="gold-count">💰 {player.gold} Goldů</p>
      <p>📈 Level: {player.level}</p>

      <div style={{ background: '#444', borderRadius: '5px', margin: '10px 0' }}>
        <div style={{ 
          width: `${player.experience}%`, 
          background: '#3498db', 
          height: '10px', 
          borderRadius: '5px',
          transition: 'width 0.3s' 
        }}></div>
      </div>

      <div style={{textAlign: 'left', margin: '15px 0', borderTop: '1px solid #444', paddingTop: '10px'}}>
        <p>💪 Síla: {player.strength}</p>
        <p>🧠 Inteligence: {player.intelligence}</p>
        <p>🔋 Výdrž: {player.stamina}</p>
      </div>
    </div>
  );
}

export default Character;