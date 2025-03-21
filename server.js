import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import session from 'express-session';

const app = express();
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'afl_predictions'
});

// Middleware to check if user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.playerId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  next();
};

// Auth routes
app.post('/rules/api/auth/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if player exists
    const [existingPlayers] = await pool.query(
      'SELECT * FROM players WHERE email = ?',
      [email]
    );
    
    let player;
    if (existingPlayers.length === 0) {
      // Create new player
      const [result] = await pool.query(
        'INSERT INTO players (name, email) VALUES (?, ?)',
        [name, email]
      );
      player = { id: result.insertId, name, email };
    } else {
      player = existingPlayers[0];
    }
    
    req.session.playerId = player.id;
    res.json(player);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Game routes
app.get('/rules/api/games/current-round', requireLogin, async (req, res) => {
  try {
    const [rounds] = await pool.query(
      'SELECT MAX(round_number) as current_round FROM rounds'
    );
    res.json(rounds[0].current_round);
  } catch (error) {
    console.error('Get current round error:', error);
    res.status(500).json({ error: 'Failed to get current round' });
  }
});

app.get('/rules/api/games/round/:roundNumber', requireLogin, async (req, res) => {
  try {
    const [games] = await pool.query(
      `SELECT g.*, 
        t1.name as team1_name, t2.name as team2_name,
        t1.id as team1_id, t2.id as team2_id
       FROM games g
       JOIN teams t1 ON g.team1_id = t1.id
       JOIN teams t2 ON g.team2_id = t2.id
       WHERE g.round_id = (SELECT id FROM rounds WHERE round_number = ?)`,
      [req.params.roundNumber]
    );
    
    // Transform the results to match our frontend expectations
    const transformedGames = games.map(game => ({
      id: game.id,
      round_id: game.round_id,
      team1_id: game.team1_id,
      team2_id: game.team2_id,
      winner_id: game.winner_id,
      team1: { id: game.team1_id, name: game.team1_name },
      team2: { id: game.team2_id, name: game.team2_name }
    }));
    
    res.json(transformedGames);
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
});

// Prediction routes
app.post('/rules/api/predictions', requireLogin, async (req, res) => {
  try {
    const { game_id, predicted_winner_id } = req.body;
    
    // Check if prediction already exists
    const [existing] = await pool.query(
      'SELECT * FROM predictions WHERE player_id = ? AND game_id = ?',
      [req.session.playerId, game_id]
    );
    
    if (existing.length > 0) {
      // Update existing prediction
      await pool.query(
        'UPDATE predictions SET predicted_winner_id = ? WHERE player_id = ? AND game_id = ?',
        [predicted_winner_id, req.session.playerId, game_id]
      );
    } else {
      // Create new prediction
      await pool.query(
        'INSERT INTO predictions (player_id, game_id, predicted_winner_id) VALUES (?, ?, ?)',
        [req.session.playerId, game_id, predicted_winner_id]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Submit prediction error:', error);
    res.status(500).json({ error: 'Failed to submit prediction' });
  }
});

app.get('/rules/api/predictions/stats', requireLogin, async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        p.id as player_id,
        p.name as player_name,
        p.email as player_email,
        COUNT(CASE WHEN pr.predicted_winner_id = g.winner_id THEN 1 END) as wins,
        COUNT(CASE WHEN pr.predicted_winner_id != g.winner_id AND g.winner_id IS NOT NULL THEN 1 END) as losses
       FROM players p
       LEFT JOIN predictions pr ON p.id = pr.player_id
       LEFT JOIN games g ON pr.game_id = g.id
       GROUP BY p.id, p.name, p.email
       ORDER BY wins DESC, losses ASC`
    );
    
    // Transform the results to match our frontend expectations
    const transformedStats = stats.map(stat => ({
      player: {
        id: stat.player_id,
        name: stat.player_name,
        email: stat.player_email
      },
      wins: stat.wins || 0,
      losses: stat.losses || 0,
      total: (stat.wins || 0) - (stat.losses || 0)
    }));
    
    res.json(transformedStats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Ladder prediction routes
app.post('/rules/api/ladder-predictions', requireLogin, async (req, res) => {
  try {
    const { round_number, team_id, predicted_position } = req.body;
    
    // Check if prediction already exists
    const [existing] = await pool.query(
      'SELECT * FROM ladder_predictions WHERE player_id = ? AND round_number = ? AND team_id = ?',
      [req.session.playerId, round_number, team_id]
    );
    
    if (existing.length > 0) {
      // Update existing prediction
      await pool.query(
        'UPDATE ladder_predictions SET predicted_position = ? WHERE player_id = ? AND round_number = ? AND team_id = ?',
        [predicted_position, req.session.playerId, round_number, team_id]
      );
    } else {
      // Create new prediction
      await pool.query(
        'INSERT INTO ladder_predictions (player_id, round_number, team_id, predicted_position) VALUES (?, ?, ?, ?)',
        [req.session.playerId, round_number, team_id, predicted_position]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Submit ladder prediction error:', error);
    res.status(500).json({ error: 'Failed to submit ladder prediction' });
  }
});

app.get('/rules/api/ladder-predictions/round/:roundNumber', requireLogin, async (req, res) => {
  try {
    const [predictions] = await pool.query(
      `SELECT lp.*, t.name as team_name
       FROM ladder_predictions lp
       JOIN teams t ON lp.team_id = t.id
       WHERE lp.round_number = ?
       ORDER BY lp.predicted_position ASC`,
      [req.params.roundNumber]
    );
    
    // Transform the results to match our frontend expectations
    const transformedPredictions = predictions.map(pred => ({
      id: pred.id,
      player_id: pred.player_id,
      round_number: pred.round_number,
      team_id: pred.team_id,
      predicted_position: pred.predicted_position,
      team: { id: pred.team_id, name: pred.team_name }
    }));
    
    res.json(transformedPredictions);
  } catch (error) {
    console.error('Get ladder predictions error:', error);
    res.status(500).json({ error: 'Failed to get ladder predictions' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 