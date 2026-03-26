require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');  
const cors = require('cors');
 

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Tohle je na Renderu nutné pro zabezpečené spojení
});

 

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Chyba připojení k DB:', err);
  } else {
    console.log('✅ Databáze je připojená a odpovídá!');
  }
});


// 2. get data from database
app.get('/player', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT 1');
    res.json(result.rows[0]); // Pošleme první řádek z tabulky jako JSON
  } catch (err) {
    console.error(err);
    res.status(500).send('Chyba: Nepodařilo se spojit s databází.');
  }
});

// 3. home page
app.get('/', (req, res) => {
  res.send('Backend SFgame běží a čeká na hrdiny!');
});

 

// Cesta pro "práci v hospodě" - přidá 10 zlata
app.post('/work', async (req, res) => {
  try {
    await pool.query('UPDATE users SET gold = gold + 10 WHERE id = 1');
    const result = await pool.query('SELECT * FROM users WHERE id = 1');
    res.json(result.rows[0]); // Vrátíme aktualizovaného hrdinu
  } catch (err) {
    console.error(err);
    res.status(500).send('Chyba při práci');
  }
});



// Cesta pro "práci v hospodě" - přidá 10 zlata
app.post('/exp', async (req, res) => {
  try {
    await pool.query('UPDATE users SET experience = experience + 10 WHERE id = 1');
    
    let result = await pool.query('SELECT * FROM users WHERE id = 1');
    let player = result.rows[0];  

// 3. Logika Level Upu: Pokud má 100 nebo víc XP
    if (player.experience >= 100) {
      // Zvýšíme level, XP vynulujeme (nebo odečteme 100) a můžeme třeba přidat bonus k síle
      await pool.query(`UPDATE users SET level = level + 1, experience = 0, strength = strength + 2 WHERE id = 1`);
      
      // Znovu načteme data po Level Upu
      const updatedResult = await pool.query('SELECT * FROM users WHERE id = 1');
      player = updatedResult.rows[0];
      console.log("LEVEL UP! Gratulujeme.");
    }



    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).send('Chyba při práci');
  }
});


app.listen(PORT, () => {
  console.log(`Server úspěšně běží na http://localhost:${PORT}`);
});