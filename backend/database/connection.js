import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

try {
    await client.connect();
    await client.db("travel-tracker").command({ ping: 1 });
    console.log(
        "Pinged database"
    );
} catch(err) {
    console.error(err);
}

let db = client.db("travel-tracker");

export default db;