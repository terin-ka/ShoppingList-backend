import mongoclient, { user_col } from "../services/database.js";

// profil uživatele
export async function getAllUsers(req, res) {
  //  předám userId jako query parametr
  let users = null;
  try {
    await mongoclient.connect();
    users = await user_col.find({}).toArray();
  } finally {
    await mongoclient.close();
  }
  res.status(200).json(users);
}
