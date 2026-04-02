import React, { useEffect, useState } from "react";
import "./App.css";

//components
import Character from "./components/XCharacter";
import Tavern from "./components/XTavern";
import XLeaderboard from "./components/Leaderboard";
import Arena from "./components/Arena";

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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regName, password: regPass }),
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

  const handleLogin = async () => {
    if (!regName || !regPass) return alert("Vyplň jméno a heslo!");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regName, password: regPass }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("rpg_player", JSON.stringify(data));
        setPlayer(data);
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (err) {
      alert("Server neodpovídá.");
    } finally {
      setLoading(false);
    }
  };

  const handleWork = () => {
    if (!player) return;
    fetch(`${API_URL}/work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: player.id }),
    })
      .then((res) => res.json())
      .then((data) => setPlayer(data))
      .catch((err) => console.error("Chyba při práci:", err));
    fetchLeaderboard();
  };

  const handleExp = () => {
    if (!player) return;

    fetch(`${API_URL}/exp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: player.id }), // <--- Posíláme ID tvého hrdiny
    })
      .then((res) => res.json())
      .then((data) => setPlayer(data))
      .catch((err) => console.error("Chyba při expení:", err));
    fetchLeaderboard();
  };

  // --- TENTO BLOK PŘIDEJ ---
  useEffect(() => {
    const savedPlayer = localStorage.getItem("rpg_player");

    if (savedPlayer) {
      const playerData = JSON.parse(savedPlayer); // Zkusíme ověřit, zda hráč v DB stále existuje
      fetch(`${API_URL}/player_by_id?id=${playerData.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Hráč nenalezen"); // Pokud hráč v DB není
          return res.json();
        })
        .then((data) => {
          if (data) {
            setPlayer(data);
            localStorage.setItem("rpg_player", JSON.stringify(data));
          }
        })
        .catch((err) => {
          console.log("Hráč už v databázi neexistuje, odhlašuji...");
          // --- TADY JE TO DŮLEŽITÉ ---
          setPlayer(null);
          localStorage.removeItem("rpg_player");
        });
    }
  }, []);
  // -------------------------

  // 1. Přidej nový stav nahoře v App()
  const [leaderboard, setLeaderboard] = useState([]);

  // 2. Přidej funkci pro načtení žebříčku
  const fetchLeaderboard = () => {
    fetch(`${API_URL}/leaderboard`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error("Chyba žebříčku:", err));
  };

  // 3. Spusť načtení žebříčku hned po startu nebo při každé akci
  useEffect(() => {
    // ... tvůj stávající kód s localStorage ...
    fetchLeaderboard(); // Načteme žebříček při startu
  }, []);

  return (
    <div className="App">
      <h1>RPG gameska - Rozcestník</h1>

      {player ? (
        <div className="tab-navigation">
          {/* --- HLAVNÍ MENU --- */}
          <div
            className="tab-navigation"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <button onClick={() => setActiveTab("postava")}>🛡️ Postava</button>
            <button onClick={() => setActiveTab("arena")}>🍺 Arena</button>
            <button onClick={() => setActiveTab("hospoda")}>🍺 Hospoda</button>
            <button onClick={() => setActiveTab("obchod")}>🛒 Obchod</button>
            <button onClick={() => setActiveTab("cech")}>🏰 Cech</button>
            <button onClick={() => setActiveTab("leaderboard")}>
              🏆 Síň slávy
            </button>
          </div>

          {/* --- ZOBRAZENÍ ZÁLOŽEK --- */}
          {/* Všimni si, jak posíláme proměnné (props) z App.js do těch komponent! */}

          {activeTab === "postava" && <Character player={player} />}

          {activeTab === "hospoda" && (
            <Tavern handleWork={handleWork} handleExp={handleExp} />
          )}

          {activeTab === "arena" && (
            <Arena handleWork={handleWork} handleExp={handleExp} />
          )}

          {activeTab === "obchod" && (
            <div>
              <h2>🛒 Obchod</h2>
              <p>Tady brzy budou zbraně a lektvary.</p>
            </div>
          )}

          {activeTab === "cech" && (
            <div>
              <h2>🏰 Cech</h2>
              <p>Tady brzy bude cechovní chat a bonusy.</p>
            </div>
          )}

          {activeTab === "leaderboard" && (
            // Tady bys mohl mít <Leaderboard leaderboard={leaderboard} />, pokud si to taky oddělíš!
            <div className="leaderboard-card">
              <XLeaderboard leaderboard={leaderboard} />
            </div>
          )}
        </div>
      ) : (
        /* --- REGISTRACE --- */
        /* --- REGISTRACE --- */
        <div className="auth-card">
          <h2>{/* Nadpis */} Vítej v RPG světě</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "300px",
              margin: "0 auto",
            }}
          >
            <input
              type="text"
              placeholder="Jméno hrdiny"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              style={{ padding: "10px" }}
            />
            <input
              type="password"
              placeholder="Heslo"
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              style={{ padding: "10px" }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{ flex: 1, padding: "10px", cursor: "pointer" }}
              >
                {loading ? "..." : "🔑 Přihlásit"}
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor: "#4CAF50",
                  color: "white",
                }}
              >
                {loading ? "..." : "⚔️ Registrace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
