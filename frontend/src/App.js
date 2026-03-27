import React, { useEffect, useState } from 'react';
import './App.css';
import heroImage from './hero.png';

 
const API_URL = "https://rpggame-backend.onrender.com";

function App() {
  const [player, setPlayer] = useState(null);

  // Nové stavy pro formulář
  const [regName, setRegName] = useState("");
  const [regPass, setRegPass] = useState("");
  const [loading, setLoading] = useState(false);

  // Funkce pro registraci
  const handleRegister = async () => {
    if (!regName || !regPass) return alert("Vyplň jméno a heslo!");
    setLoading(true);


  
  try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regName, password: regPass })
      });

      if (response.ok) {
        const data = await response.json();
        setPlayer(data); // Rovnou přihlásíme vytvořeného hrdinu
        alert("Hrdina úspěšně vytvořen!");
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (err) {
      console.error("Chyba při registraci:", err);
      alert("Server neodpovídá.");
    } finally {
      setLoading(false);
    }
  };

  const handleWork = () => {
    fetch(`${API_URL}/work`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setPlayer(data); 
      })
      .catch(err => console.error("Chyba při práci:", err));
  };

  const handleExp = () => {
    fetch(`${API_URL}/exp`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setPlayer(data); 
      })
      .catch(err => console.error("Chyba při práci:", err));
  };

  return (
    <div className="App">
      <h1>SFgame Klon - Rozcestník</h1>
       
      
      {player ? (
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
        <button className="work-btn" onClick={handleWork}>
          Pracovat v hospodě
        </button>

        <button className="work-btn" onClick={handleExp}>
          Jdi na dobrodružství
        </button>
         
      </div>
      ) : (
        <p>Hledám hrdinu v databázi...</p>

        
      )}
    </div>
  );

  
}


export default App;

