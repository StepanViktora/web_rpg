require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Tohle je na Renderu nutné pro zabezpečené spojení
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Chyba připojení k DB:", err);
  } else {
    console.log("✅ Databáze je připojená a odpovídá!");
  }
});

const bcrypt = require("bcrypt");

// ... (tady máš definovaný pool a express)

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Zašifrujeme heslo (nikdy neukládáme čistý text!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Uložíme nového hráče do databáze se základními statistikami
    const newUser = await pool.query(
      "INSERT INTO users (username, password, level, gold, experience, strength, intelligence, stamina) VALUES ($1, $2, 1, 100, 0, 5, 5, 5) RETURNING id, username, level, gold",
      [username, hashedPassword],
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      // Kód pro unikátní jméno v PostgreSQL
      res.status(400).send("Tento herní přezdívka je již obsazená.");
    } else {
      res.status(500).send("Chyba při vytváření hrdiny.");
    }
  }
});

const bcrypt = require("bcrypt");

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Porovnáme heslo z formuláře s hashem v DB
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        // Odstraníme heslo z objektu, než ho pošleme do frontendu
        delete user.password;
        res.json(user);
      } else {
        res.status(401).send("Nesprávné heslo.");
      }
    } else {
      res.status(404).send("Hrdina neexistuje.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Chyba při přihlašování.");
  }
});

// 2. get data from database
// Cesta pro načtení jednoho konkrétního hrdiny
app.get("/player_by_id", async (req, res) => {
  const { id } = req.query; // ID čteme z URL (např. ?id=5)
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Chyba při hledání hrdiny");
  }
});

// 3. home page
app.get("/", (req, res) => {
  res.send("Backend SFgame běží a čeká na hrdiny!");
});

// Cesta pro žebříček top 10 hráčů
app.get("/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT username, level, gold FROM users ORDER BY level DESC, experience DESC LIMIT 10",
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Chyba při načítání žebříčku");
  }
});

// Cesta pro "práci v hospodě" - přidá 10 zlata
app.post("/work", async (req, res) => {
  const { id } = req.body;

  try {
    await pool.query("UPDATE users SET gold = gold + 10 WHERE id = $1", [id]);
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    res.json(result.rows[0]); // Vrátíme aktualizovaného hrdinu
  } catch (err) {
    console.error(err);
    res.status(500).send("Chyba při práci");
  }
});

app.post("/battle", async (req, res) => {
  const { attackerId, defenderId } = req.body;

  try {
    // 1. Načteme oba hráče
    const attackerRes = await pool.query("SELECT * FROM users WHERE id = $1", [
      attackerId,
    ]);
    const defenderRes = await pool.query("SELECT * FROM users WHERE id = $1", [
      defenderId,
    ]);

    if (attackerRes.rows.length === 0 || defenderRes.rows.length === 0) {
      return res.status(404).send("Jeden z hráčů nebyl nalezen.");
    }

    const attacker = attackerRes.rows[0];
    const defender = defenderRes.rows[0];

    // 2. Logika souboje (Náhoda + bonus za sílu)
    // Každý hodí kostkou 1-100 a přičte se mu polovina jeho síly
    const attackerScore = Math.random() * 100 + attacker.strength / 2;
    const defenderScore = Math.random() * 100 + defender.strength / 2;

    let winner, loser, message;
    if (attackerScore > defenderScore) {
      winner = attacker;
      loser = defender;
      message = `Vítězství! Porazil jsi hráče ${defender.username}.`;
      // Vítěz získá 20 zlata, poražený ztratí 10 (pokud má)
      await pool.query(
        "UPDATE users SET gold = gold + 20, experience = experience + 15 WHERE id = $1",
        [attacker.id],
      );
      await pool.query(
        "UPDATE users SET gold = GREATEST(0, gold - 10) WHERE id = $1",
        [defender.id],
      );
    } else {
      winner = defender;
      loser = attacker;
      message = `Prohra! Hráč ${defender.username} tě zmlátil.`;
      await pool.query(
        "UPDATE users SET gold = GREATEST(0, gold - 10) WHERE id = $1",
        [attacker.id],
      );
      await pool.query("UPDATE users SET gold = gold + 10 WHERE id = $1", [
        defender.id,
      ]);
    }

    // 3. Vrátíme aktualizovaná data útočníka, aby se mu v Reactu hned změnilo zlato
    const updatedAttacker = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [attacker.id],
    );
    res.json({ message, player: updatedAttacker.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Chyba při souboji.");
  }
});

// Cesta pro "práci v hospodě" - přidá 10 zlata
app.post("/exp", async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query(
      "UPDATE users SET experience = experience + 10 WHERE id = $1",
      [id],
    );

    let result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    let player = result.rows[0];

    if (player.experience >= 100) {
      // Zvýšíme level, XP vynulujeme (nebo odečteme 100) a můžeme třeba přidat bonus k síle
      await pool.query(
        "UPDATE users SET level = level + 1, experience = 0, strength = strength + 2 WHERE id = $1",
        [id],
      );

      const updatedResult = await pool.query(
        "SELECT * FROM users WHERE id = $1",
        [id],
      );
      player = updatedResult.rows[0];
      console.log("LEVEL UP! Gratulujeme.");
    }

    res.json(player);
  } catch (err) {
    console.error(err);
    res.status(500).send("Chyba při práci");
  }
});

app.listen(PORT, () => {
  console.log(`Server úspěšně běží na http://localhost:${PORT}`);
});
