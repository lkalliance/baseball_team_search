const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const { ADDRCONFIG } = require('dns');
const app = express();

const PORT = 3001;

app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection(
  {
    host: '127.0.0.1',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: 'blah99',
    database: 'bb_card_db'
  },
  console.log(`Connected to the bb_card_db database.`)
);

app.get('/api/team/:tid/:year/:uid', (req, res) => {
  const { tid, year, uid } = req.params;

  db.query(`SELECT c.player_mlb_id FROM cards_x_user cxu JOIN users u ON cxu.user=u.uid JOIN cards c ON cxu.card=c.cid WHERE c.team_mlb_id=? AND c.year=? AND user=?`, [tid, year, uid], (err, result) => {
    const players=[];
    for (id of result) {
      players.push(id.player_mlb_id);
    }
    res.send(JSON.stringify(players));
  })
})

app.post('/api/card/add', (req, res) => {
  const { playerId, year } = req.body;

  console.log("I'm here!");

  // check to see if card exists
  db.query('SELECT cid FROM cards WHERE player_mlb_id=? AND year=?', [playerId, year], (err, result) => {
    if (err) console.log(err)
    else if (result.length > 0) (result) => {
      console.log(result);
      console.log("Already have this card");
      console.log("about to add " + result + " to the database");
      addCollect(result[0], uid);
    }
    else {
      console.log("About to add the card for " + JSON.stringify(req.body));
      addCard(req.body);
    }
  })

  const addCard = async function (player) {
    const { playerId, playerName, playerSort, team, teamAbbrev, teamName, type, uid, year } = player;
    db.query('INSERT INTO cards (type, player_name, player_name_sort, player_mlb_id, year, team, team_abbrev, team_mlb_id) VALUE (?, ?, ?, ?, ?, ?, ?, ?);', [type, playerName, playerSort, parseInt(playerId), parseInt(year), teamName, teamAbbrev, parseInt(team)], (err, result2) => {
      addCollect(result2.insertId, uid);
    })
  }

  const addCollect = async function (card, user) {
    db.query('INSERT INTO cards_x_user (user, card) VALUE (?, ?);', [user, card], (err, result) => {
      res.send(result);
    })
  }
})

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
})




app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));