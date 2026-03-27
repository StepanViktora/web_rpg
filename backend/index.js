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


const bcrypt = require('bcrypt');

// ... (tady máš definovaný pool a express)

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Zašifrujeme heslo (nikdy neukládáme čistý text!)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Uložíme nového hráče do databáze se základními statistikami
        const newUser = await pool.query(
            'INSERT INTO users (username, password, level, gold, experience, strength, intelligence, stamina) VALUES ($1, $2, 1, 100, 0, 5, 5, 5) RETURNING id, username, level, gold',
            [username, hashedPassword]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Kód pro unikátní jméno v PostgreSQL
            res.status(400).send("Tento herní přezdívka je již obsazená.");
        } else {
            res.status(500).send("Chyba při vytváření hrdiny.");
        }
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
  const { id } = req.body;
  
  try {
    await pool.query('UPDATE users SET gold = gold + 10 WHERE id = $1', [id]);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    res.json(result.rows[0]); // Vrátíme aktualizovaného hrdinu
  } catch (err) {
    console.error(err);
    res.status(500).send('Chyba při práci');
  }
});



// Cesta pro "práci v hospodě" - přidá 10 zlata
app.post('/exp', async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query('UPDATE users SET experience = experience + 10 WHERE id = $1', [id]);
    
    let result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    let player = result.rows[0];  

 
    if (player.experience >= 100) {
      // Zvýšíme level, XP vynulujeme (nebo odečteme 100) a můžeme třeba přidat bonus k síle
      await pool.query('UPDATE users SET level = level + 1, experience = 0, strength = strength + 2 WHERE id = $1', [id]);
      
       
      const updatedResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
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