const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// URI de conexão ao MongoDB
const uri = "mongodb+srv://flutter:flutter@clusterluiz.yzscwl0.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLuiz";

// Nome do banco de dados
const dbName = 'BrainFocusTrainner';

// Nome da coleção
const collectionName = 'usuario';

// Função para buscar documentos
async function getDocuments() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Conectado ao MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const documents = await collection.find({}).toArray();

        return documents;

    } catch (err) {
        console.error(`Erro ao conectar ao MongoDB: ${err}`);
        throw err;
    } finally {
        await client.close();
    }
}



// Definir o endpoint GET
app.get('/usuarios', async (req, res) => {
    try {
        const documents = await getDocuments();
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar documentos do MongoDB' });
    }
});

// Definir o endpoint POST para registro de usuários
app.post('/register', async (req, res) => {
    const { email, password, psychologistEmail, userName } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Inserir novo usuário
        const result = await collection.insertOne({ email, password, psychologistEmail, userName });
        console.log('Usuário inserido:', result); // Adicionando log para verificar a inserção
        res.status(201).json({ message: 'Usuário registrado com sucesso' });

    } catch (err) {
        console.error(`Erro ao registrar usuário: ${err}`);
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    } finally {
        await client.close();
    }
});

// Definir o endpoint POST para login de usuários
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Verificar as credenciais do usuário
        const user = await collection.findOne({ email, password });

        if (user) {
            res.status(200).json({ message: 'Login bem-sucedido', token: 'dummy-token' });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }

    } catch (err) {
        console.error(`Erro ao verificar login: ${err}`);
        res.status(500).json({ error: 'Erro ao verificar login' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
