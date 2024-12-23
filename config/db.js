import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const database = client.db("edulink");

async function connectDB(req, res) {
  try {
    await client.connect();
    await database.command({ ping: 1 });
    console.log("mongodb connected");
  } catch (e) {
    res.send("Database connection error");
  }
}

export { database, connectDB };
