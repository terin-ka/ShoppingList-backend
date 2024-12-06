import { dbConfig } from "../../config/config.js";
import { MongoClient } from "mongodb";

const mongoclient = new MongoClient(dbConfig.connectionstring, {
  monitorCommands: dbConfig.monitor ?? false,
  maxPoolSize: 10, //optimalizuje připojování a odpojování databáze
  minPoolSize: 2,
});
mongoclient.on("commandStarted", (started) => console.log(started));

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await mongoclient.connect();
    // Send a ping to confirm a successful connection
    await mongoclient.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.log(err.message);
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoclient.close();
  }
}

// run();    test connection

export const db = mongoclient.db(dbConfig.database);
export const userCollection = db.collection("User");
export const listCollection = db.collection("List");

export const user_col = db.collection("user");
export const user_session_col = db.collection("user_session");
export const oauth_account_col = db.collection("oauth_account");

export default mongoclient;
