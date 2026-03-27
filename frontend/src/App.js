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
        localStorage.setItem("rpg_player", JSON.stringify(data));
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
    if(!player) return; 
    fetch(`${API_URL}/work`,{ 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: player.id })
    
    
    })
      .then(res => res.json())
      .then(data => setPlayer(data))
      .catch(err => console.error("Chyba při práci:", err));
      fetchLeaderboard()
  };

  const handleExp = () => {
  if (!player) return;

  fetch(`${API_URL}/exp`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: player.id }) // <--- Posíláme ID tvého hrdiny
  })
    .then(res => res.json())
    .then(data => setPlayer(data))
    .catch(err => console.error("Chyba při expení:", err));
    fetchLeaderboard()
    
};

// --- TENTO BLOK PŘIDEJ ---
  useEffect(() => {
    // 1. Koukneme se do tajné zásuvky prohlížeče (localStorage)
    const savedPlayer = localStorage.getItem("rpg_player");

    if (savedPlayer) {
      // 2. Pokud tam něco je, převedeme to z textu na objekt a dáme do hry
      const playerData = JSON.parse(savedPlayer);
      setPlayer(playerData);

      // 3. (Dobrovolné, ale doporučené) Zeptáme se backendu na aktuální goldy
      // Aby hráč neměl stará data, pokud mezitím někdo jiný něco změnil
      fetch(`${API_URL}/player_by_id?id=${playerData.id}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
             setPlayer(data);
             localStorage.setItem("rpg_player", JSON.stringify(data));
          }
        })
        .catch(err => console.log("Nepodařilo se aktualizovat hrdinu při startu"));
    }
  }, []); // Ty prázdné závorky zajistí, že se to spustí jen 1x po načtení
  // -------------------------


  // 1. Přidej nový stav nahoře v App()
const [leaderboard, setLeaderboard] = useState([]);

// 2. Přidej funkci pro načtení žebříčku
const fetchLeaderboard = () => {
  fetch(`${API_URL}/leaderboard`)
    .then(res => res.json())
    .then(data => setLeaderboard(data))
    .catch(err => console.error("Chyba žebříčku:", err));
};

// 3. Spusť načtení žebříčku hned po startu nebo při každé akci
useEffect(() => {
  // ... tvůj stávající kód s localStorage ...
  fetchLeaderboard(); // Načteme žebříček při startu
}, []);



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
         <div className="leaderboard-card" style={{ marginTop: '30px', background: '#333', padding: '15px', borderRadius: '10px' }}>
  <h3>🏆 Síň slávy</h3>
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ borderBottom: '1px solid #555' }}>
        <th>Hráč</th>
        <th>Level</th>
        <th>Zlato</th>
      </tr>
    </thead>
    <tbody>
      {leaderboard.map((user, index) => (
        <tr key={index} style={{ borderBottom: '1px solid #444' }}>
          <td>{index + 1}. {user.username}</td>
          <td>{user.level}</td>
          <td>{user.gold}</td>
        </tr>
      ))}
    </tbody>
  </table>
  <button onClick={fetchLeaderboard} style={{ marginTop: '10px', fontSize: '0.8em' }}>
    Aktualizovat žebříček
  </button>
</div>
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

