import { ObjectId } from "mongodb";
import mongoclient, { userCollection } from "../services/database.js";

export function authorize() {
  return async (req, res, next) => {
    try {
      const { user_id } = req.headers;

      if (!user_id || typeof user_id !== "string" || !ObjectId.isValid(user_id)) {
        return res.status(400).json({ error: "Missing or invalid user ID" });
      }

      await mongoclient.connect();

      const user = await userCollection.findOne({ _id: new ObjectId(user_id) });

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      req.userId = user_id;
      next();
    } catch (err) {
      console.error("Authorization error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
