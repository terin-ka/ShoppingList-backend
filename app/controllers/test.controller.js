import mongoclient, {
    userCollection,
    listCollection,
  } from "../services/database.js";
  import { ObjectId } from "mongodb";
  
  async function getRole(listId, userId) {
    try {
      if (!listId) {
        throw new Error("Bad request: Missing list ID");
      }
  
      if (!ObjectId.isValid(listId)) {
        return res.status(400).json({ error: "Invalid list ID" });
      }
  
      const shoppingList = await listCollection.findOne({
        _id: new ObjectId(listId),
      });
  
      if (!shoppingList) {
        throw new Error("List not found");
      }
  
      if (shoppingList.owner === userId) {
        return "owner";
      } else if (shoppingList.memberList.includes(userId)) {
        return "member";
      } else {
        return "external";
      }
    } catch (error) {
      throw error; // Vyhodí chybu, kterou zachytí getList
    }
  }
  
  // Přidání člena do listu
  export async function testAddMember(req, res) {
    const { listId } = req.params;
    const { memberId } = req.body;
    const userId = req.userId;
    if (!ObjectId.isValid(listId) || !ObjectId.isValid(memberId)) {
      return res.status(400).json({ error: "Invalid list ID or member ID" });
    }
    let session;
    try {
      // Připojení k MongoDB a zahájení transakce
      await mongoclient.connect();
      session = mongoclient.startSession();
      session.startTransaction();
  
      // Ověření role uživatele
      const role = await getRole(listId, userId);
      if (role !== "owner") {
        return res.status(403).json({ error: "Access denied" });
      }
  
      // Načtení listu a uživatele
      const list = await listCollection.findOne({ _id: new ObjectId(listId) });
      if (!list) {
        throw new Error("List not found");
      }
  
      const user = await userCollection.findOne({ _id: new ObjectId(memberId) });
      if (!user) {
        throw new Error("User not found");
      }
  
      // Kontrola, zda člen už není v memberList
      if (list.memberList.includes(memberId)) {
        return res
          .status(400)
          .json({ error: "Member already exists in the list" });
      }
  
      // Přidání člena do listu
      const listResult = await listCollection.updateOne(
        { _id: new ObjectId(listId) },
        { $addToSet: { memberList: memberId } },
        { session }
      );
      if (listResult.modifiedCount === 0) {
        throw new Error("Failed to add member to the list");
      }
  
      // Přidání listu do seznamu uživatele
      const userResult = await userCollection.updateOne(
        { _id: new ObjectId(memberId) },
        { $addToSet: { membershipList: listId } },
        { session }
      );
      if (userResult.modifiedCount === 0) {
        throw new Error("Failed to add list to the user's memberships");
      }
  
      // Potvrzení transakce
      await session.commitTransaction();
      res.status(200).json({
        data: { listId, memberId },
      });
    } catch (error) {
      if (session && session.inTransaction()) {
        // Zrušení transakce při chybě
        await session.abortTransaction();
      }
      if (
        error.message === "List not found" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }
      console.error("Error adding member:", error);
      res.status(500).json({ error: "Failed to add member" });
    } finally {
      if (session) {
        session.endSession();
      }
      await mongoclient.close();
    }
  }
  
  // Odebrání člena z listu
  export async function testDeleteMember(req, res) {
    const { listId } = req.params;
    const { memberId } = req.body;
    const userId = req.userId;
    if (!ObjectId.isValid(listId) || !ObjectId.isValid(memberId)) {
      return res.status(400).json({ error: "Invalid list ID or member ID" });
    }
    let session;
    try {
      await mongoclient.connect();
      session = mongoclient.startSession();
      session.startTransaction();
  
      const role = await getRole(listId, userId);
      if (role !== "owner") {
        return res.status(403).json({ error: "Access denied" });
      }
  
      // Načtení listu a uživatele
      const list = await listCollection.findOne({ _id: new ObjectId(listId) });
      if (!list) {
        throw new Error("List not found");
      }
  
      const user = await userCollection.findOne({ _id: new ObjectId(memberId) });
      if (!user) {
        throw new Error("User not found");
      }
  
      if (!list.memberList.includes(memberId)) {
        return res.status(400).json({ error: "Member not found in the list" });
      }
      const listResult = await listCollection.updateOne(
        { _id: new ObjectId(listId) },
        { $pull: { memberList: memberId } },
        { session }
      );
      if (listResult.modifiedCount === 0) {
        return res
          .status(400)
          .json({ error: "Failed to delete member from the list" });
      }
  
      const userResult = await userCollection.updateOne(
        { _id: new ObjectId(memberId) },
        { $pull: { membershipList: listId } },
        { session }
      );
      if (userResult.modifiedCount === 0) {
        return res
          .status(400)
          .json({ error: "Failed to update user's membership" });
      }
  
      // Potvrzení transakce
      await session.commitTransaction();
      res.status(200).json({
        data: { listId, memberId },
      });
    } catch (error) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      if (
        error.message === "List not found" ||
        error.message === "User not found"
      ) {
        return res.status(404).json({ error: error.message });
      }
      console.error("Error adding member:", error);
      res.status(500).json({ error: "Member deletion failed" });
    } finally {
      if (session) {
        session.endSession();
      }
      await mongoclient.close();
    }
  }
  