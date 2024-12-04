import mongoclient, { userCollection } from "../services/database.js";

// Vracení všech userů
export async function getAllUsers(_, res) {
  try {
    await mongoclient.connect();

    const users = await userCollection.find({}).toArray();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error get all users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
