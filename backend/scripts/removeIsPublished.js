// Script to remove 'isPublished' field from all courses in MongoDB Atlas
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set.');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const dbName = uri.split('/').pop().split('?')[0] || 'lms';
    const db = client.db(dbName);
    const result = await db.collection('courses').updateMany({}, { $unset: { isPublished: "" } });
    console.log(`Removed 'isPublished' from ${result.modifiedCount} course(s).`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run(); 