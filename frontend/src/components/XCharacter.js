// frontend/src/components/Character.js
import React from "react";
import heroImage from "../hero.png"; // Tečka navíc, protože jdeme o složku výš
import "./XCharacter.css"; // Přidáme vlastní styl pro postavu

function Character({ player }) {
  return (
    <div className="stats-card character-screen">
      <div className="character-header">
        <h2>{player.username}</h2>
        <span className="level-badge">Lvl {player.level}</span>
      </div>

      <img src={heroImage} alt="Hrdina" className="hero-avatar" />

      <div className="xp-container">
        <div className="xp-bar-bg">
          <div
            className="xp-bar-fill"
            style={{ width: `${player.experience}%` }}
          ></div>
        </div>
        <span className="xp-text">XP: {player.experience} / 100</span>
      </div>

      <p className="gold-display">💰 {player.gold}</p>

      <div className="attributes-grid">
        <div className="attr-item">
          <span className="attr-icon">💪</span>
          <span className="attr-label">Síla</span>
          <span className="attr-value">{player.strength}</span>
        </div>
        <div className="attr-item">
          <span className="attr-icon">🧠</span>
          <span className="attr-label">Intel.</span>
          <span className="attr-value">{player.intelligence}</span>
        </div>
        <div className="attr-item">
          <span className="attr-icon">🔋</span>
          <span className="attr-label">Výdrž</span>
          <span className="attr-value">{player.stamina}</span>
        </div>
      </div>
    </div>
  );
}

export default Character;
