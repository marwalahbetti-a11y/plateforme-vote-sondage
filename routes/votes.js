// routes/votes.js : sondages ouverts, vote, résultats (Yassine)
const express = require('express');
const db = require('../db');
const { estConnecte } = require('../middleware/auth');
const { getResults } = require('../services/results');

const router = express.Router();

// GET /api/votes/polls/open : liste des sondages ouverts
router.get('/polls/open', async (req, res) => {
    try {
        const [sondages] = await db.query(
            `SELECT id, question, end_time
       FROM polls
       WHERE status = 'open' AND end_time > NOW()
       ORDER BY end_time`
        );
        res.json(sondages);
    } catch (erreur) {
        console.error('Erreur liste sondages :', erreur);
        res.status(500).json({ message: 'Erreur lors du chargement des sondages' });
    }
});

// GET /api/votes/polls/:id : un sondage avec ses propositions
router.get('/polls/:id', async (req, res) => {
    try {
        const pollId = req.params.id;

        const [sondages] = await db.query('SELECT * FROM polls WHERE id = ?', [pollId]);
        if (sondages.length === 0) {
            return res.status(404).json({ message: 'Sondage introuvable' });
        }

        const [options] = await db.query(
            'SELECT id, option_text FROM poll_options WHERE poll_id = ? ORDER BY id',
            [pollId]
        );

        res.json({ poll: sondages[0], options: options });
    } catch (erreur) {
        console.error('Erreur détail sondage :', erreur);
        res.status(500).json({ message: 'Erreur lors du chargement du sondage' });
    }
});

// POST /api/votes/polls/:id/vote : voter (il faut être connecté)
router.post('/polls/:id/vote', estConnecte, async (req, res) => {
    try {
        const pollId = req.params.id;
        const userId = req.session.user.id; // vient de la session de Marwa
        const { option_id } = req.body;

        // 1. Champ obligatoire
        if (!option_id) {
            return res.status(400).json({ message: 'Choisissez une proposition' });
        }

        // 2. Le sondage est-il ouvert ?
        const [ouverts] = await db.query(
            "SELECT id FROM polls WHERE id = ? AND status = 'open' AND end_time > NOW()",
            [pollId]
        );
        if (ouverts.length === 0) {
            return res.status(400).json({ message: 'Ce sondage est fermé ou introuvable' });
        }

        // 3. La proposition appartient-elle bien à ce sondage ?
        const [options] = await db.query(
            'SELECT id FROM poll_options WHERE id = ? AND poll_id = ?',
            [option_id, pollId]
        );
        if (options.length === 0) {
            return res.status(400).json({ message: 'Proposition invalide pour ce sondage' });
        }

        // 4. L'utilisateur a-t-il déjà voté ?
        const [dejaVote] = await db.query(
            'SELECT id FROM votes WHERE poll_id = ? AND user_id = ?',
            [pollId, userId]
        );
        if (dejaVote.length > 0) {
            return res.status(409).json({ message: 'Vous avez déjà voté pour ce sondage' });
        }

        // 5. Enregistrer le vote
        //    (la contrainte UNIQUE de MySQL est le 2e filet de sécurité)
        try {
            await db.query(
                'INSERT INTO votes (poll_id, user_id, option_id) VALUES (?, ?, ?)',
                [pollId, userId, option_id]
            );
        } catch (erreurSql) {
            if (erreurSql.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Vous avez déjà voté pour ce sondage' });
            }
            throw erreurSql;
        }

        // 6. Calculer les résultats et les envoyer à TOUTE la room du sondage
        const resultats = await getResults(pollId);
        const io = req.app.get('io');
        io.to('poll_' + pollId).emit('results_update', resultats);

        res.status(201).json({ message: 'Vote enregistré avec succès' });
    } catch (erreur) {
        console.error('Erreur vote :', erreur);
        res.status(500).json({ message: 'Erreur lors du vote' });
    }
});

// GET /api/votes/polls/:id/results : résultats actuels
router.get('/polls/:id/results', async (req, res) => {
    try {
        const resultats = await getResults(req.params.id);
        res.json(resultats);
    } catch (erreur) {
        console.error('Erreur résultats :', erreur);
        res.status(500).json({ message: 'Erreur lors du calcul des résultats' });
    }
});

module.exports = router;