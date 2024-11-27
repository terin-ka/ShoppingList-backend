import mongoclient, { userCollection } from "../services/database.js";

// Vracení všech aktivních seznamů
export async function getAllUsers(req, res) {
  try {
    await mongoclient.connect();

    const users = await userCollection.find({}).toArray();

    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get all userss" });
  } finally {
    await mongoclient.close();
  }
}
