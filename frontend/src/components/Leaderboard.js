import React from "react";

const handleBattle = async (defenderId) => {
  if (!player) return;
  try {
    const response = await fetch(`${API_URL}/battle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attackerId: player.id, defenderId: defenderId }),
    });
    const data = await response.json();
    alert(data.message);
    setPlayer(data.player); // Aktualizujeme stav tvého hrdiny
    fetchLeaderboard(); // Obnovíme žebříček (kvůli zlatu ostatních)
  } catch (err) {
    console.error("Chyba souboje:", err);
  }
};

function XLeaderboard({ leaderboard }) {
  return (
    <div className="leaderboard-container" style={{ padding: "20px" }}>
      <h2>🏆 Síň slávy (Top 10)</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Hráč</th>
            <th style={{ textAlign: "center", padding: "8px" }}>Level</th>
            <th style={{ textAlign: "right", padding: "8px" }}>Zlato</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{user.username}</td>
                <td style={{ textAlign: "center", padding: "8px" }}>
                  {user.level}
                </td>
                <td style={{ textAlign: "right", padding: "8px" }}>
                  💰 {user.gold}
                </td>
                <td style={{ textAlign: "right", padding: "8px" }}>
                  {user.username !== currentPlayerName && (
                    <button
                      onClick={() => onBattle(user.id)}
                      style={{ cursor: "pointer" }}
                    >
                      ⚔️ Vyzvat
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                Zatím tu nikdo není...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default XLeaderboard;
