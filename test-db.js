const db = require('./db');

async function tester() {
  try {
    const [lignes] = await db.query('SHOW TABLES');
    console.log('✅ Connexion MySQL réussie. Tables trouvées :');
    console.table(lignes);
    process.exit(0);
  } catch (erreur) {
    console.error('❌ Erreur de connexion :', erreur.message);
    process.exit(1);
  }
}

tester();