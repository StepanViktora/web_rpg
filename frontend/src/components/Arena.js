import React from "react";

function Arena({ handleWork, handleExp }) {
  return (
    <div
      className="tavern-card"
      style={{ background: "#333", padding: "20px", borderRadius: "10px" }}
    >
      <h2>🍺 Hospoda</h2>
      <p>Tady budeš bojot o slávu!</p>
    </div>
  );
}

export default Arena;
