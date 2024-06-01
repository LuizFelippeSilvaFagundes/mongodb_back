const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3333;

app.use(bodyParser.json());
app.use(cors());

// URI de conexão ao MongoDB
const uri = "mongodb+srv://flutter:flutter@clusterluiz.yzscwl0.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLuiz";

// Nome do banco de dados
const dbName = 'BrainFocusTrainner';

// Nome das coleções
const userCollectionName = 'usuario';
const psychologistCollectionName = 'psicologo';
const recordCollectionName = 'recordes';

// Função para buscar documentos de uma coleção genérica
async function getDocuments(collectionName) {
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

// Função para buscar documentos de usuários
async function getUserDocuments() {
    return getDocuments(userCollectionName);
}

// Função para buscar documentos de psicólogos
async function getPsychologistDocuments() {
    return getDocuments(psychologistCollectionName);
}

// Função para buscar documentos de recordes
async function getRecordDocuments() {
    return getDocuments(recordCollectionName);
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

// Definir o endpoint GET para recordes
app.get('/recordes', async (req, res) => {
    try {
        const documents = await getRecordDocuments();
        res.status(200).json(documents);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar documentos de recordes do MongoDB' });
    }
});

// Função para inserir um documento genérico
async function insertDocument(collectionName, document) {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Inserir documento
        const result = await collection.insertOne(document);
        console.log('Documento inserido:', result); // Adicionando log para verificar a inserção
        return result;

    } catch (err) {
        console.error(`Erro ao inserir documento na coleção ${collectionName}: ${err}`);
        throw err;
    } finally {
        await client.close();
    }
}

// Definir o endpoint POST para registro de usuários
app.post('/register_user', async (req, res) => {
    const { email, password, psychologistEmail, userName } = req.body;

    try {
        const result = await insertDocument(userCollectionName, { email, password, psychologistEmail, userName });
        res.status(201).json({ message: 'Usuário registrado com sucesso' });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

// Definir o endpoint POST para registro de psicólogos
app.post('/register_psychologist', async (req, res) => {
    const { email, password, name, cip } = req.body;

    try {
        const result = await insertDocument(psychologistCollectionName, { email, password, name, cip });
        res.status(201).json({ message: 'Psicólogo registrado com sucesso' });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao registrar psicólogo' });
    }
});

// Definir o endpoint POST para adicionar um novo tempo recorde
app.post('/recordes', async (req, res) => {
    const { tempo, quantidadeToques } = req.body;

    try {
        const result = await insertDocument(recordCollectionName, { tempo, quantidadeToques });
        res.status(201).json({ message: 'Tempo recorde adicionado com sucesso' });

    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar tempo recorde' });
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
