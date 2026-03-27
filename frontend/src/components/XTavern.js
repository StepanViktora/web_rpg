import React from 'react';

function Tavern({ handleWork, handleExp }) {
  return (
    <div className="tavern-card" style={{ background: '#333', padding: '20px', borderRadius: '10px' }}>
      <h2>🍺 Hospoda</h2>
      <p>Tady můžeš trávit svůj čas a získávat suroviny.</p>
      
      <button className="work-btn" onClick={handleWork} style={{ marginRight: '10px' }}>
        Pracovat v hospodě (+ Goldy)
      </button>
      <button className="work-btn" onClick={handleExp}>
        Jdi na dobrodružství (+ Zkušenosti)
      </button>
    </div>
  );
}

export default Tavern;