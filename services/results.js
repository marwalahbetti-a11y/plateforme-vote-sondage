// services/results.js : calcul des résultats d'un sondage (Yassine)
const db = require('../db');

// Retourne le nombre de votes et le pourcentage de chaque proposition
async function getResults(pollId) {
    const [lignes] = await db.query(
        `SELECT o.id, o.option_text, COUNT(v.id) AS votes
     FROM poll_options o
     LEFT JOIN votes v ON v.option_id = o.id
     WHERE o.poll_id = ?
     GROUP BY o.id, o.option_text
     ORDER BY o.id`,
        [pollId]
    );

    // 1. Total des votes
    let total = 0;
    lignes.forEach((ligne) => {
        total = total + ligne.votes;
    });

    // 2. Pourcentage de chaque proposition
    const options = lignes.map((ligne) => {
        let pourcentage = 0;
        if (total > 0) {
            pourcentage = Math.round((ligne.votes / total) * 100);
        }
        return {
            id: ligne.id,
            option_text: ligne.option_text,
            votes: ligne.votes,
            pourcentage: pourcentage
        };
    });

    return { pollId: Number(pollId), total: total, options: options };
}

module.exports = { getResults };