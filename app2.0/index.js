const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
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
const userCollectionName = 'usuarios';
const psychologistCollectionName = 'psicologos';
const recordCollectionName = 'recordes';

// Função para buscar documentos de uma coleção genérica
async function getDocuments(collectionName, query = {}) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const documents = await collection.find(query).toArray();
        console.log(`Fetched documents from ${collectionName}:`, documents); // Log dos documentos buscados
        return documents;
    } finally {
        await client.close();
    }
}

// Função para inserir um documento genérico
async function insertDocument(collectionName, document) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(document);
        console.log(`Inserted document into ${collectionName}:`, result); // Log do resultado da inserção
        return result;
    } finally {
        await client.close();
    }
}

// Endpoint para registrar usuário
app.post('/register_user', async (req, res) => {
    const { email, nome, senha } = req.body;
    console.log('Registering user:', { email, nome, senha }); // Log dos dados recebidos
    try {
        const result = await insertDocument(userCollectionName, { email, nome, senha, _recordes: [] });
        res.status(201).json({ message: 'Usuário registrado com sucesso', _id: result.insertedId });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

// Endpoint para registrar psicólogo
app.post('/register_psychologist', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Registering psychologist:', { email, senha }); // Log dos dados recebidos
    try {
        const result = await insertDocument(psychologistCollectionName, { email, senha, usuarios_atrelados: [] });
        res.status(201).json({ message: 'Psicólogo registrado com sucesso' });
    } catch (err) {
        console.error('Erro ao registrar psicólogo:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao registrar psicólogo' });
    }
});

// Endpoint para validar login de usuário
app.post('/login_user', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Logging in user:', { email, senha }); // Log dos dados recebidos
    try {
        const users = await getDocuments(userCollectionName, { email, senha });
        if (users.length > 0) {
            res.status(200).json({ message: 'Login bem-sucedido', _id: users[0]._id, nome: users[0].nome });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (err) {
        console.error('Erro ao validar login de usuário:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao validar login de usuário' });
    }
});

// Endpoint para validar login de psicólogo
app.post('/login_psychologist', async (req, res) => {
    const { email, senha } = req.body;
    console.log('Logging in psychologist:', { email, senha }); // Log dos dados recebidos
    try {
        const psychologists = await getDocuments(psychologistCollectionName, { email, senha });
        if (psychologists.length > 0) {
            res.status(200).json({ message: 'Login bem-sucedido' });
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (err) {
        console.error('Erro ao validar login de psicólogo:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao validar login de psicólogo' });
    }
});

// Endpoint para obter psicólogos disponíveis
app.get('/available_psychologists', async (req, res) => {
    console.log('Fetching available psychologists'); // Log da ação
    try {
        const psychologists = await getDocuments(psychologistCollectionName);
        const availablePsychologists = psychologists.filter(p => p.usuarios_atrelados.length === 0);
        res.status(200).json(availablePsychologists);
    } catch (err) {
        console.error('Erro ao obter psicólogos disponíveis:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao obter psicólogos disponíveis' });
    }
});

// Endpoint para atribuir usuário a psicólogo
app.post('/assign_user_to_psychologist', async (req, res) => {
    const { emailUsuario, emailPsicologo } = req.body;
    console.log('Assigning user to psychologist:', { emailUsuario, emailPsicologo }); // Log dos dados recebidos
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const psicologo = await db.collection(psychologistCollectionName).findOne({ email: emailPsicologo });
        const usuario = await db.collection(userCollectionName).findOne({ email: emailUsuario });

        if (psicologo && usuario) {
            await db.collection(psychologistCollectionName).updateOne(
                { email: emailPsicologo },
                { $push: { usuarios_atrelados: usuario.nome } }
            );
            res.status(200).json({ message: 'Usuário atribuído ao psicólogo com sucesso' });
        } else {
            res.status(404).json({ error: 'Usuário ou psicólogo não encontrado' });
        }
    } catch (err) {
        console.error('Erro ao atribuir usuário ao psicólogo:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao atribuir usuário ao psicólogo' });
    } finally {
        await client.close();
    }
});

// Endpoint para registrar um recorde
app.post('/add_record', async (req, res) => {
    const { _id_user, tempo, quantidadeToques } = req.body;
    console.log('Adding record:', { _id_user, tempo, quantidadeToques }); // Log dos dados recebidos
    try {
        const result = await insertDocument(recordCollectionName, { _id_user: ObjectId(_id_user), tempo, quantidadeToques });
        res.status(201).json({ message: 'Recorde registrado com sucesso' });
    } catch (err) {
        console.error('Erro ao registrar recorde:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao registrar recorde' });
    }
});

// Endpoint para obter recordes de um usuário
app.get('/user_records/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Fetching records for user:', id); // Log do ID do usuário
    try {
        const records = await getDocuments(recordCollectionName, { _id_user: ObjectId(id) });
        res.status(200).json(records);
    } catch (err) {
        console.error('Erro ao obter recordes do usuário:', err); // Log do erro
        res.status(500).json({ error: 'Erro ao obter recordes do usuário' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
