// realtime.js : Socket.IO (rooms) + clôture automatique des sondages (Yassine)
const db = require('./db');
const { getResults } = require('./services/results');

function demarrerTempsReel(io) {

    // ---------- Socket.IO : une room par sondage ----------
    io.on('connection', (socket) => {
        console.log('Un client est connecté :', socket.id);

        // Le navigateur demande à rejoindre la room d'un sondage
        socket.on('join_poll', (pollId) => {
            socket.join('poll_' + pollId);
            console.log(socket.id + ' a rejoint la room poll_' + pollId);
        });

        // Le navigateur quitte la room
        socket.on('leave_poll', (pollId) => {
            socket.leave('poll_' + pollId);
        });

        socket.on('disconnect', () => {
            console.log('Client déconnecté :', socket.id);
        });
    });

    // ---------- Clôture automatique (vérification toutes les 10 secondes) ----------
    setInterval(async () => {
        try {
            // 1. Sondages encore "open" dont l'heure de fin est dépassée
            const [aFermer] = await db.query(
                "SELECT id FROM polls WHERE status = 'open' AND end_time <= NOW()"
            );

            // 2. Pour chacun : passer en "closed" puis prévenir la room
            for (const sondage of aFermer) {
                await db.query("UPDATE polls SET status = 'closed' WHERE id = ?", [sondage.id]);
                console.log('Sondage ' + sondage.id + ' clôturé automatiquement');

                const resultats = await getResults(sondage.id);
                io.to('poll_' + sondage.id).emit('poll_closed', resultats);
            }
        } catch (erreur) {
            console.error('Erreur clôture automatique :', erreur);
        }
    }, 10000);
}

module.exports = demarrerTempsReel;