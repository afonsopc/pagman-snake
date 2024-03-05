const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Connect to the SQLite database
const db = new sqlite3.Database('database/scores.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the scores database.');
});


// Cria a tabela 'scores' se ainda não existir
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY,
      utilizador TEXT NOT NULL,
      score INTEGER NOT NULL
    )`);
  
    console.log('Tabela "scores" criada com sucesso.');
});

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
app.use(express.static('src'));

// POST route for adding or updating a score
app.post('/scores', (req, res) => {
  const { utilizador, score } = req.body;
  console.log(utilizador + ': ' + score);

  // Check if the user already exists
  db.get('SELECT score FROM scores WHERE utilizador = ?', [utilizador], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      // User does not exist, insert new score
      db.run('INSERT INTO scores (utilizador, score) VALUES (?, ?)', [utilizador, score], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        return res.status(201).json({ message: 'New score added.' });
      });
    } else {
      // User exists, check if new score is higher
      if (score > row.score) {
        db.run('UPDATE scores SET score = ? WHERE utilizador = ?', [score, utilizador], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          return res.status(200).json({ message: 'Score updated.' });
        });
      } else {
        return res.status(200).json({ message: 'Score not higher than previous.' });
      }
    }
  });
});

// GET route to fetch all scores in descending order
app.get('/scores', (req, res) => {
    db.all('SELECT * FROM scores ORDER BY score DESC', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json(rows);
    });
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
