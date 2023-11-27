const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
app.use(express.json())

const initializeServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is  running')
    })
  } catch (e) {
    console.log(`Db Error is: ${e.message}`)
    process.exit(1)
  }
}

initializeServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team;`
  const playersArray = await db.all(getPlayerQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `
  INSERT INTO cricket_team (player_name, jersey_number, role)
  VALUES ('${playerName}', ${jerseyNumber}, '${role}');`
  const player = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT * FROM cricket_team
  WHERE player_id = '${playerId}';`
  const singlePlayer = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(singlePlayer))
})

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayer = `
  UPDATE cricket_team
  SET player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE player_id = '${playerId}';
  `
  await db.run(updatePlayer)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
  DELETE FROM cricket_team
  WHERE player_id = '${playerId}';`
  await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
