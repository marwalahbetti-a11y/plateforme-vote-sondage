// public/js/auth-client.js : JavaScript côté navigateur pour l'authentification (Marwa)

// Affiche un message coloré (succès ou erreur)
function afficherMessage(texte, type) {
  const zone = document.getElementById('message');
  if (!zone) return;
  zone.innerHTML = `<div class="alert alert-${type}">${texte}</div>`;
}

// Envoie une requête JSON au serveur
async function appelerApi(url, methode, donnees) {
  const options = {
    method: methode,
    headers: { 'Content-Type': 'application/json' }
  };
  if (donnees) options.body = JSON.stringify(donnees);

  const reponse = await fetch(url, options);
  const json = await reponse.json();
  return { ok: reponse.ok, data: json };
}

// ---------- Page d'inscription ----------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const { ok, data } = await appelerApi('/register', 'POST', {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      });
      if (ok) {
        afficherMessage('Inscription réussie, redirection vers la connexion...', 'success');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      } else {
        afficherMessage(data.message, 'danger');
      }
    } catch (erreur) {
      afficherMessage('Impossible de contacter le serveur', 'danger');
    }
  });
}

// ---------- Page de connexion ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const { ok, data } = await appelerApi('/login', 'POST', {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      });
      if (ok) {
        window.location.href = '/profile-page';
      } else {
        afficherMessage(data.message, 'danger');
      }
    } catch (erreur) {
      afficherMessage('Impossible de contacter le serveur', 'danger');
    }
  });
}

// ---------- Page de profil ----------
const infoUsername = document.getElementById('infoUsername');
if (infoUsername) {
  async function chargerProfil() {
    try {
      const { ok, data } = await appelerApi('/profile', 'GET');
           if (!ok) {
        afficherMessage('Erreur profil : ' + data.message, 'danger');
        return;
      }
      const u = data.user;
      document.getElementById('infoUsername').textContent = u.username;
      document.getElementById('infoEmail').textContent = u.email;
      document.getElementById('infoRole').textContent = u.role;
      document.getElementById('infoDate').textContent = new Date(u.created_at).toLocaleDateString('fr-FR');
    } catch (erreur) {
      afficherMessage('Impossible de charger le profil', 'danger');
    }
  }
  chargerProfil();

  // Modifier le nom d'utilisateur
  document.getElementById('usernameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { ok, data } = await appelerApi('/profile', 'PUT', {
      username: document.getElementById('newUsername').value
    });
    afficherMessage(data.message, ok ? 'success' : 'danger');
    if (ok) {
      document.getElementById('newUsername').value = '';
      chargerProfil();
    }
  });

  // Modifier le mot de passe
  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { ok, data } = await appelerApi('/profile', 'PUT', {
      currentPassword: document.getElementById('currentPassword').value,
      newPassword: document.getElementById('newPassword').value
    });
    afficherMessage(data.message, ok ? 'success' : 'danger');
    if (ok) document.getElementById('passwordForm').reset();
  });

  // Déconnexion
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await appelerApi('/logout', 'POST');
    window.location.href = '/login';
  });
}