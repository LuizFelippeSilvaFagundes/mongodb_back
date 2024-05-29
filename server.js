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
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Conectar ao MongoDB
        await client.connect();
        console.log("Conectado ao MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Buscar documentos na coleção
        const documents = await collection.find({}).toArray();

        return documents;

    } catch (err) {
        console.error(`Erro ao conectar ao MongoDB: ${err}`);
        throw err;
    } finally {
        // Fechar a conexão
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
