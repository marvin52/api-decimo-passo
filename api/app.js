const express = require('express');
const firebaseAdmin = require('firebase-admin');
const md5 = require('md5');
const app = express();

// Configuração do Firebase Admin SDK
const serviceAccount = require('./api/serviceAccountKey.json'); // Substitua pelo caminho para o seu arquivo serviceAccountKey.json
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://46494290241.firebaseio.com', // Substitua pelo URL do seu projeto Firebase
});

// Middleware para processar requisições JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Rota para inserir o usuário no Firestore
app.post('/addUser', async (req, res) => {
  try {
    const { name, email, password, role, description } = req.body;
    const encryptedPassword = md5(password); // Criptografa a senha em MD5

    const db = firebaseAdmin.firestore();
    const userRef = db.collection('users');

    await userRef.add({
      name,
      email,
      password: encryptedPassword,
      role,
      description,
    });

    res.status(201).json({ message: 'Usuário inserido com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocorreu um erro ao inserir o usuário.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
