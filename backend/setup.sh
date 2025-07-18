#!/bin/bash

# Install dependencies
npm install mongodb redis express dotenv helmet cors fuse.js
pip install pymongo beautifulsoup4 requests python-dotenv

# Start databases
docker-compose up -d

# Initialize MongoDB indexes
docker exec ketivee-backend node -e "
  require('dotenv').config();
  const { MongoClient } = require('mongodb');
  
  async function setup() {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    await db.collection('pages').createIndex(
      { title: 'text', content: 'text' },
      { name: 'TextIndex', weights: { title: 10, content: 5 } }
    );
    
    await db.collection('pages').createIndex(
      { title: 1 },
      { name: 'autocomplete', collation: { locale: 'en', strength: 2 } }
    );
    
    console.log('Database indexes created!');
    process.exit(0);
  }

  setup().catch(console.error);
"

# Start crawler
docker exec ketivee-backend python services/crawler.py

# Start server
docker exec -d ketivee-backend node server.js

echo "KetiveeSearch deployed successfully!"
echo "Access at: http://localhost:6329/api/search"