const express = require('express');
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');
const md5 = require('md5');
const app = express();

const crypto = require('crypto');
const bodyParser = require('body-parser');


app.use(bodyParser.json());

// Configuração do Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "decimo-passo",
  "private_key_id": "21e7e9b98d2dabb20c22bc31aec62804b5e36123",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCeouL3jD0QOJxR\njjzuqFHkRUk5yjOHNHhnqrwR1ZwIqECWnEx1tnoNKXNYXdMcUFUKHQaHwyxHKjYX\nebwd2AtRQtUSTHcn5Z6twalDYgY7ZJoVfKIpsgwEns+rV5Mz1s4qAO4p2enW9U2z\nftBHJhOEkyLPedQq0P6C689z4DcyTrnoSrAqvUhZadjjEpEMlYbWKNx54WT3nJZa\nBAMHG0p6TtQtj/Tdk8GkfijIjYGR/R7PU69NCMT4vYFQ7U77MU4M2ELmexaoSc9h\ns6sP/R022594Sx7kvs9sVozgYE76i+8fL3j1OMe/qa3jJPng9v90YTWuVL3KsGWm\n9sv8ks/rAgMBAAECggEAPu9APBVW5GiRG4nigowkcPtL4bFmX+1hFz+U/T5ReN3H\nQfkgHFMYeMBJEnWmm0UDd8+sF5BGsLT+YLHa/7wGQWbSQUA0xY9DNIvwKttovYdb\n2cpoS0Jnoi2fFcrYi2hcwi08Tz40lyMagGt/Fbr1Y1M8LDOZCKOBVU9YLhB11W7m\nRPLujJbkik7YojfA5Y+SGrLuvPYsL0D9+IqbtRVP0s1CsoXwNPrq30kvT/gQr29S\nsBM54H+2fmdPv3aPjWRaonwDpcqjTOR6d+a9+juKE/DKAIDs48cVB5nZLRjz2MZT\n0hp/bnJQnAgpAIOdHZ1V91eizzQLRWgLIXzETl0lgQKBgQDNXxpRs3/bJNrKR2Et\nuBZbD8LFx2AnOJhnojHbpOlcBGXCbEfOOfAhgrAtIoWKANBuii+Zf2Os1S9dpEJ2\nDRPg87LOfe8TEIXgEdSHuLHmGj+5REA6/BZMsoF0Bo0UePGXx2ahbCD9WVZB/4a1\njt8CZ0hGoKoiRs4w6Z9819yvNQKBgQDFvliqFsXYASr9vbeorGYMAja79Me6dpOR\n35f69fTCHMW6AhpHxbcpZ7Y1YALrXN8ooqkbcCFSwwF5yARWw7LZ49U1D2WkheMO\nEVEjVNZHgDlM59gH8FapVfbNeqaix5t6O8JeJJDybkYjflq0yoH6AwneISI7y9iX\nQ80XQ+PGnwKBgDuWN2WzJgqoY87C7SA9xEbBiOqnkW9vzVBsT/kBnS+0mu3RSvg7\n+T9P0twVoxdKay9Xar4npvzzkd2iliH4Y2cmbh/ZjC9E4QMFSVvjq8IupYSUl+pF\nUBcKx+KpL+/bs4UtNsrpO50meY+Gm0g8Xtosq1zKqvJtBtBMSJkJbJ9tAoGAZS52\ns+GfLl26n8d5uGcueCqR0y73G+QcsmGUpKdBrCmIyxrUU7FJfXhB9aHBHKmSznoc\nyZtgkbaShLvh7HuKgo9fwxyzx7FycvpNaCS62C82IrHnCnjh/xerh4ygw14bojn9\nxKo1OLdQUE0RIL0WMNVpMS4HFE3D7/KTeLoWTMUCgYABzxIrvy0y58ydldWdyecX\nILLOKM6PSpTyeqOe/Kv3QJMwpN5L0SGk2ce7PiRYvM9Adh1gXLgmdQIz4LufCHw5\npYAZT+4GVp9KDMhhA0I0APVzhasdTUdPpQI8H8Izo9WGrlH4ZLHAHfFlGAJuX7VG\n1vAvBQ985Dv+1G0Z2nOC3Q==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-z3fay@decimo-passo.iam.gserviceaccount.com",
  "client_id": "103887719164314973674",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z3fay%40decimo-passo.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://46494290241.firebaseio.com', // Substitua pelo URL do seu projeto Firebase
});

// Middleware para processar requisições JSON
app.use(express.json());
app.use(cors());

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Configuração da coleção "users" no Firestore
const usersCollection = admin.firestore().collection('users');

// Rota para fazer o login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busque o usuário no Firestore pelo email
    const userSnapshot = await usersCollection.where('email', '==', email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Obtém o primeiro documento retornado (deve ser único, pois estamos filtrando pelo email)
    const userDoc = userSnapshot.docs[0];

    // Verifica se a senha fornecida corresponde à senha no banco (criptografada em MD5)
    if (md5(password) !== userDoc.data().password) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Se as credenciais estiverem corretas, retorna os dados do usuário
    return res.json(userDoc.data());
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Ocorreu um erro ao fazer login.' });
  }
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
