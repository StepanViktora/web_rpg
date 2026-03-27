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
      /* --- ČÁST 1: TADY JE TVOJE HRA (Zůstává jak ji máš) --- */
      <div className="stats-card">
        <h2>Hrdina: {player.username}</h2>
        <img src={heroImage} alt="Hrdina" className="hero-avatar" />
        <p className="gold-count">💰 {player.gold} Goldů</p>
        <p>📈 Level: {player.level}</p>
        {/* ... zbytek tvého designu s barem a tlačítky ... */}
        <button className="work-btn" onClick={handleWork}>Pracovat v hospodě</button>
        <button className="work-btn" onClick={handleExp}>Jdi na dobrodružství</button>
      </div>
    ) : (
      /* --- ČÁST 2: TADY BUDE TEN LOGIN (Místo "Hledám hrdinu...") --- */
      <div className="auth-card" style={{ padding: '20px', background: '#222', borderRadius: '10px', marginTop: '20px' }}>
        <h2>Vytvoř si hrdinu</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
          <input 
            type="text" 
            placeholder="Jméno hrdiny" 
            value={regName} // Nezapomeň přidat nahoře: const [regName, setRegName] = useState("");
            onChange={(e) => setRegName(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px' }}
          />
          <input 
            type="password" 
            placeholder="Heslo" 
            value={regPass} // Nezapomeň přidat nahoře: const [regPass, setRegPass] = useState("");
            onChange={(e) => setRegPass(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px' }}
          />
          <button 
            onClick={handleRegister} // Tuhle funkci musíš mít v kódu (viz moje minulá zpráva)
            style={{ padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Vstoupit do světa
          </button>
        </div>
        <p style={{ fontSize: '0.8em', color: '#888', marginTop: '15px' }}>
          Tip: Pokud už hrdinu máš, zatím ho registrace prostě přihlásí (než doděláme samostatný Login).
        </p>
      </div>
    )}
  </div>
);

  
}


export default App;

