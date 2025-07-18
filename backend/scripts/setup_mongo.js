const { MongoClient } = require('mongodb');
require('dotenv').config();

async function setupDatabase() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('pages');
        
        // Create text index for search
        await collection.createIndex(
            { title: "text", content: "text" },
            { 
                name: "TextIndex",
                weights: { title: 10, content: 5 },
                default_language: "english"
            }
        );
        
        // Create URL index
        await collection.createIndex(
            { url: 1 },
            { unique: true }
        );
        
        console.log("Database indexes created successfully");
    } catch (err) {
        console.error("Database setup error:", err);
    } finally {
        await client.close();
    }
}

setupDatabase(); 