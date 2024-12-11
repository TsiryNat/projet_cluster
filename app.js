// Importer le module Express
const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');

// Créer une instance d'Express
const app = express();

// Configurer le moteur de vues EJS
app.set('view engine', 'ejs');

// Spécifier le dossier où Express cherchera les vues
app.set('views', path.join(__dirname, 'views'));

// Servir les fichiers statiques (CSS, images, etc.) depuis le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Utiliser le middleware pour parser le corps des requêtes (formulaire)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




// Configurer la session
app.use(session({
  secret: 'cle', // Remplacez par une clé secrète
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Si vous utilisez HTTPS, mettez secure: true
}));

// Créer la connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'compte'
});


// Tester la connexion
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connexion à la base de données réussie');
});








// login
app.post('/submit', (req, res) => {
  const { email, num_tel } = req.body;
  console.log(`Email: ${email}, Numéro de téléphone: ${num_tel}`);

  // Vérifier si l'email et le numéro de téléphone existent dans la base de données
  connection.query('SELECT * FROM utilisateur WHERE email = ? AND num_telephone = ?', [email, num_tel], (err, results) => {
    if (err) {
      console.error('Erreur lors de la requête:', err);
      res.status(500).send('Erreur lors de la vérification des informations.');
      return;
    }

    if (results.length > 0) {
      // Si l'utilisateur existe, enregistrer les informations dans la session
      req.session.utilisateur = results[0];
      console.log('Utilisateur trouvé:', results[0]);

      // Rediriger vers une autre page (par exemple, page d'accueil)
      res.redirect('/accueil');
    } else {
      // Si l'email ou le numéro de téléphone est incorrect, rediriger vers la page de login avec une erreur
      res.redirect('/login_user?error=1');
      console.log('===> numero telephone ou email incorrect !!!');
    }
  });
});


// inscription
app.post('/insertion', (req, res) => {
  // Récupérer les données du formulaire
  const { nom, email, num_tel } = req.body;

  // Vérifier que les champs ne sont pas vides
  if (!nom || !email || !num_tel) {
    return res.status(400).send('Tous les champs sont obligatoires.');
  }

  // Insérer les données dans la base de données
  const sql = 'INSERT INTO utilisateur (nom, email, num_telephone) VALUES (?, ?, ?)';
  connection.query(sql, [nom, email, num_tel], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion des données:', err);
      res.status(500).send('Erreur lors de l\'enregistrement des données.');
      return;
    }

    console.log('Utilisateur enregistré avec succès:', result);
    res.redirect('/registre?error=1');
    // res.send(`<h1>Utilisateur enregistré avec succès !</h1><p>Nom: ${nom}</p><p>Email: ${email}</p><p>Numéro: ${num_tel}</p>`);
  });
});

app.get('/accueil', (req, res) => {
  if (req.session.utilisateur) {
    // Si l'utilisateur est connecté, afficher son information
    res.send(`<h1>Bienvenue, ${req.session.utilisateur.nom}!</h1><p>Email: ${req.session.utilisateur.email}</p>`);
  } else {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de login
    res.redirect('/login_user');
  }
});


app.get('/login_user', (req, res) => {
  const error = req.query.error ?? 0;
  res.render('login', { query: { error: error } });
});

app.get('/registre', (req, res) => {
  const error = req.query.error ?? 0;
  res.render('inscription', { query: { error: error } });
});

app.get('/juste_index', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
    res.send('This is the About page!');
});
  









// Démarrer le serveur
const port = 3000;
app.listen(port, () => {
  console.log(`Serveur Express.js en cours d'exécution sur http://localhost:${port}`);
});
