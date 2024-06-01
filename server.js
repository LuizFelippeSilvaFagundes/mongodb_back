const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// URI de conexão ao MongoDB
const uri = "mongodb+srv://flutter:flutter@clusterluiz.yzscwl0.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLuiz";

// Nome do banco de dados
const dbName = 'BrainFocusTrainner';

// Nome da coleção de usuários
const userCollectionName = 'usuario';

// Nome da coleção de psicólogos
const psychologistCollectionName = 'psicologo';

// Nome da coleção de recordes
const recordsCollectionName = 'recordes';

// Função para buscar documentos de usuários
async function getUserDocuments() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Conectado ao MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(userCollectionName);

        const documents = await collection.find({}).toArray();

        return documents;

    } catch (err) {
        console.error(`Erro ao conectar ao MongoDB: ${err}`);
        throw err;
    } finally {
        await client.close();
    }
}

// Função para buscar documentos de psicólogos
async function getPsychologistDocuments() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Conectado ao MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(psychologistCollectionName);

        const documents = await collection.find({}).toArray();

        return documents;

    } catch (err) {
        console.error(`Erro ao conectar ao MongoDB: ${err}`);
        throw err;
    } finally {
        await client.close();
    }
}

// Definir o endpoint GET para usuários
app.get('/usuarios', async (req, res) => {
    try {
        const documents = await getUserDocuments();
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar documentos de usuários do MongoDB' });
    }
});

// Definir o endpoint GET para psicólogos
app.get('/psicologo', async (req, res) => {
    try {
        const documents = await getPsychologistDocuments();
        
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar documentos de psicólogos do MongoDB' });
    }
});

// Definir o endpoint POST para registro de usuários
app.post('/register_user', async (req, res) => {
    const { email, password, psychologistEmail, userName } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(userCollectionName);

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

// Definir o endpoint POST para registro de psicólogos
app.post('/register_psychologist', async (req, res) => {
    const { email, password, name, cip } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(psychologistCollectionName);

        // Inserir novo psicólogo
        const result = await collection.insertOne({ email, password, name, cip });
        console.log('Psicólogo inserido:', result); // Adicionando log para verificar a inserção
        res.status(201).json({ message: 'Psicólogo registrado com sucesso' });

    } catch (err) {
        console.error(`Erro ao registrar psicólogo: ${err}`);
        res.status(500).json({ error: 'Erro ao registrar psicólogo' });
    } finally {
        await client.close();
    }
});

// Definir o endpoint POST para login de usuários
app.post('/login_user', async (req, res) => {
    const { email, password } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(userCollectionName);

        // Verificar as credenciais do usuário
        const user = await collection.findOne({ email, password });

        if (user) {
            res.status(200).json({ message: 'Login bem-sucedido', token: 'dummy-token' });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }

    } catch (err) {
        console.error(`Erro ao verificar login de usuário: ${err}`);
        res.status(500).json({ error: 'Erro ao verificar login de usuário' });
    } finally {
        await client.close();
    }
});

// Definir o endpoint POST para login de psicólogos
app.post('/login_psychologist', async (req, res) => {
    const { email, password } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(psychologistCollectionName);

        // Verificar as credenciais do psicólogo
        const psychologist = await collection.findOne({ email, password });

        console.log(`Tentativa de login: email=${email}, password=${password}`);
        console.log(`Encontrado: ${psychologist ? JSON.stringify(psychologist) : 'nenhum usuário encontrado'}`);

        if (psychologist) {
            res.status(200).json({ message: 'Login bem-sucedido', token: 'dummy-token' });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }

    } catch (err) {
        console.error(`Erro ao verificar login de psicólogo: ${err}`);
        res.status(500).json({ error: 'Erro ao verificar login de psicólogo' });
    } finally {
        await client.close();
    }
});

// Definir o endpoint POST para adicionar recordes
app.post('/addrecord', async (req, res) => {
    const { score, elapsedTime, nivel } = req.body;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(recordsCollectionName);

        // Inserir novo recorde
        const result = await collection.insertOne({ score, elapsedTime, nivel });
        console.log('Recorde adicionado:', result); // Adicionando log para verificar a inserção
        res.status(201).json({ message: 'Recorde adicionado com sucesso' });

    } catch (err) {
        console.error(`Erro ao adicionar recorde: ${err}`);
        res.status(500).json({ error: 'Erro ao adicionar recorde' });
    } finally {
        await client.close();
    }
});

// Definir o endpoint GET para obter todos os recordes
app.get('/recordes', async (req, res) => {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(recordsCollectionName);

        const records = await collection.find({}).toArray();

        res.status(200).json(records);
    } catch (err) {
        console.error(`Erro ao buscar recordes: ${err}`);
        res.status(500).json({ error: 'Erro ao buscar recordes' });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
