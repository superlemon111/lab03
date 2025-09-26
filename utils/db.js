const { MongoClient, ObjectId } = require('mongodb');

process.env.MONGODB_URI = 'mongodb://lab-03:gEswYjIstAua3Dd7uuNCtQUjOg7vSFFAbvbOYnmKwsRihYizMBl9wwMxFU2XXx4wAacfr59RymRiACDb3LHjxQ==@lab-03.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@lab-03@';

if (!process.env.MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('bookingsDB');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };