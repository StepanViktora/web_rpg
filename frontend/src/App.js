import React, { useEffect, useState } from 'react';
import './App.css';

//components
import Character from './components/XCharacter';
import Tavern from './components/XTavern';


const API_URL = "https://rpggame-backend.onrender.com";

function App() {
  const [player, setPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState("postava"); //tab
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
        alert("Hrdina úspěšně vytvořen!");s
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
        <div className="game-container">
          
          {/* --- HLAVNÍ MENU --- */}
          <div className="tab-navigation" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab("postava")}>🛡️ Postava</button>
            <button onClick={() => setActiveTab("hospoda")}>🍺 Hospoda</button>
            <button onClick={() => setActiveTab("obchod")}>🛒 Obchod</button>
            <button onClick={() => setActiveTab("cech")}>🏰 Cech</button>
            <button onClick={() => setActiveTab("leaderboard")}>🏆 Síň slávy</button>
          </div>

          {/* --- ZOBRAZENÍ ZÁLOŽEK --- */}
          {/* Všimni si, jak posíláme proměnné (props) z App.js do těch komponent! */}
          
          {activeTab === "postava" && <Character player={player} />}
          
          {activeTab === "hospoda" && <Tavern handleWork={handleWork} handleExp={handleExp} />}
          
          {activeTab === "obchod" && <div><h2>🛒 Obchod</h2><p>Tady brzy budou zbraně a lektvary.</p></div>}
          
          {activeTab === "cech" && <div><h2>🏰 Cech</h2><p>Tady brzy bude cechovní chat a bonusy.</p></div>}
          
          {activeTab === "leaderboard" && (
             // Tady bys mohl mít <Leaderboard leaderboard={leaderboard} />, pokud si to taky oddělíš!
             <div className="leaderboard-card">...Tvůj kód s tabulkou žebříčku...</div>
          )}

        </div>
      ) : (
        /* --- REGISTRACE --- */
        <div className="auth-card"> ... tvůj registrační formulář ... </div>
      )}
    </div>
  );
}

export default App;