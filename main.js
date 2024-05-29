const { MongoClient } = require('mongodb');

// URI de conexão ao MongoDB
const uri = "mongodb+srv://flutter:flutter@clusterluiz.yzscwl0.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLuiz";

// Nome do banco de dados
const dbName = 'BrainFocusTrainner';

// Nome da coleção
const collectionName = 'usuario';

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

        console.log("Documentos encontrados:");
        console.log(documents);

    } catch (err) {
        console.error('Erro ao conectar ao MongoDB: ${err}');
    } finally {
        // Fechar a conexão
        await client.close();
    }
}

getDocuments().catch(console.error);