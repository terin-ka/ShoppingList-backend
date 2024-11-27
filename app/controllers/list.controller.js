import mongoclient, {
  userCollection,
  listCollection,
} from "../services/database.js";
import { ObjectId } from "mongodb";
import { nanoid } from 'nanoid';

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

// Vrací informace o listu na základě ID
export async function getList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ error: "Invalid list ID" });
  }
  try {
    await mongoclient.connect();
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }

    const list = await listCollection.findOne({ _id: new ObjectId(listId) });
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }
    res.status(200).json(list);
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "List retrieval failed" });
  } finally {
    await mongoclient.close();
  }
}

// Vrací potvrzení o vytvoření listu
export async function createList(req, res) {
  const { listName } = req.body;
  const userId = req.userId;
  try {
    await mongoclient.connect();
    const list = await listCollection.insertOne({
      listName: listName,
      isArchived: false,
      owner: userId,
      memberList: [],
      itemList: [],
    });

    res.status(200).json(list.insertedId);
  } catch (error) {
    return res.status(500).json({ error: "List creation failed" });
  } finally {
    await mongoclient.close();
  }
}

// Vrací potvrzení o smazání listu
export async function deleteList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ error: "Invalid list ID" });
  }
  try {
    await mongoclient.connect();
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }

    const list = await listCollection.deleteOne({
      _id: new ObjectId(listId),
    });
    if (list.deletedCount === 0) {
      return res.status(404).json({ error: "List not found" });
    }

    res.status(200).json(listId);
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "List deletion failed" });
  } finally {
    await mongoclient.close();
  }
}

// Vrací potvrzení o úpravě listu
export async function updateList(req, res) {
  const { listId } = req.params;
  const { name } = req.body;
  const userId = req.userId;
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ error: "Invalid list ID" });
  }
  try {
    await mongoclient.connect();
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const list = await listCollection.updateOne(
      { _id: new ObjectId(listId) },
      { $set: { listName: name } }
    );

    res.status(200).json(listId);
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "List update failed" });
  } finally {
    await mongoclient.close();
  }
}

// Přepínání vlastnosti archive
export async function toggleArchive(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ error: "Invalid list ID" });
  }
  try {
    await mongoclient.connect();
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const list = await listCollection.findOne({ _id: new ObjectId(listId) });
    const result = await listCollection.updateOne(
      { _id: new ObjectId(listId) },
      { $set: { isArchived: !list.isArchived } }
    );

    res.status(200).json({
      message: "List toggled successfully",
      data: { result },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "List toggle failed" });
  } finally {
    await mongoclient.close();
  }
}

// Přidání člena do listu
export async function addMember(req, res) {
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
export async function deleteMember(req, res) {
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

// Member opustí list //Není to stejný jako delete meber?
export async function leaveList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  try {
    const role = await getRole(listId, userId);
    if (role !== "member") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "Member leave the list successfully",
      data: { listId, userId },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Vytvoří novou položku v seznamu
export async function createItem(req, res) {
  const { listId } = req.params;
  const { name, count } = req.body;
  const userId = req.userId;

  if (!ObjectId.isValid(listId) || !ObjectId.isValid(memberId)) {
    return res.status(400).json({ error: "Invalid list ID or member ID" });
  }
  try {
    await mongoclient.connect();
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }

    const list = await listCollection.findOne({ _id: new ObjectId(listId) });
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    const newItem = {
      itemId: nanoid(8), // Generování jedinečného itemId
      itemName: name,
      count: count,
      resolved: false,
    };

    const result = await listCollection.updateOne(
      { _id: new ObjectId(listId) },
      { $push: { itemList: newItem } } // Přidání nového itemu
    );
    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Failed to create item" });
    }

    res.status(200).json(newItem);
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to create item" });
  } finally {
    await mongoclient.close();
  }
}

// Ostranění položky v seznamu
export async function deleteItem(req, res) {
  const { listId } = req.params;
  const { itemId } = req.body;
  const userId = req.userId;
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ error: "Invalid list ID" });
  }

  try {
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }

    await mongoclient.connect();
    const list = await listCollection.findOne({ _id: new ObjectId(listId) });
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    const result = await listCollection.updateOne(
      { _id: new ObjectId(listId) },
      { $pull: { itemList: { itemId: itemId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: "Failed to delete item" });
    }

    res.status(200).json(itemId);
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to delete item" });
  } finally {
    await mongoclient.close();
  }
}

// Nastavení listu jako archivovaného
export async function toggleResolveItem(req, res) {
  const { listId } = req.params;
  const { itemId } = req.body;
  const userId = req.userId;

  try {
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "Item toggled successfully",
      data: { listId, itemId, userId },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await mongoclient.close();
  }
}

export async function getUnresolvedItems(req, res) {
  const { listId } = req.params;
  const userId = req.userId;

  try {
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "All unresolved items retrieved successfully",
      data: { userId, lists: [] },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Vracení všech aktivních seznamů
export async function getAllLists(req, res) {
  const userId = req.userId;
  try {
    await mongoclient.connect();
    
    const lists = await listCollection.find({
      $or: [
        { owner: userId }, // Uživatel je owner
        { memberList: userId } // Uživatel je v memberList
      ]
    }).toArray();

    res.status(200).json(lists);
  } catch (error) {
    return res.status(500).json({ error: "Failed to get all lists" });

  } finally {
    await mongoclient.close();
  }
}

// Vracení všech archivovaných seznamů
export async function getArchivedLists(req, res) {
  const userId = req.userId;
  try {
    await mongoclient.connect();
    
    const lists = await listCollection.find({
      isArchived: true,
      $or: [
        { owner: userId }, 
        { memberList: userId } 
      ]
    }).toArray();

    res.status(200).json(lists);
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Failed to get all archived lists" });

  } finally {
    await mongoclient.close();
  }
}
