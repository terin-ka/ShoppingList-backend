import mongoclient, {
  userCollection,
  listCollection,
} from "../services/database.js";
import { ObjectId } from "mongodb";
import { nanoid } from 'nanoid';

function getRole(list, userId) {
  if (list.owner === userId) {
    return "owner";
  } else if (list.memberList.includes(userId)) {
    return "member";
  }
  return "external";
}

// Vrácení konkrétního listu na základě listId
export async function getList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;

  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID" });
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  try {
    await mongoclient.connect();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId)});
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role === "external") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(list);
  } catch (error) {
    console.error("Error getting list :", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Vytvoření nového listu
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

    res.status(200).json({listId: list.insertedId});
  } catch (error) {
    return res.status(500).json({ message: "List creation failed" });
  }
}

export async function deleteList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;

  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  let session;
  try {
    await mongoclient.connect();
    session = mongoclient.startSession();
    session.startTransaction();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) }, {session});
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const listResult = await listCollection.deleteOne(
      { _id: ObjectId.createFromHexString(listId) },
      { session }
    );
    if (listResult.deletedCount === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Failed to delete list" });
    }

    if(role === "member"){
      const userResult = await userCollection.updateMany(
        { membershipList: listId },
        { $pull: { membershipList: listId } },
        { session }
      );
      if (userResult.modifiedCount === 0) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Failed to update users" });
      }
    }

    await session.commitTransaction();
    res.status(200).json({listId: listId});
  } catch (error) {
      if (session) await session.abortTransaction();
      console.error("Error deleting list:", error);
      return res.status(500).json({ message: "Internal server error" });
  } finally {
      if (session) session.endSession();
  }
}

// Vrací potvrzení o úpravě listu
export async function updateList(req, res) {
  const { listId } = req.params;
  const { listName } = req.body;
  const userId = req.userId;

  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  try {
    await mongoclient.connect();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (list.listName === listName) {
      return res.status(400).json({ message: "No changes were made: The name is already the same" });
    }
    const result = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId) },
      { $set: { listName: listName } }
    );
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to update list" });
    }

    res.status(200).json({ listId: listId, newName: listName});
  } catch (error) {
    console.error("Error updating list:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Přepínání vlastnosti archive
export async function toggleArchive(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  
  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  try {
    await mongoclient.connect();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const result = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId) },
      { $set: { isArchived: !list.isArchived } }
    );
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to toggle list" });
    }

    res.status(200).json({listId: listId, isArchived: !list.isArchived});
  } catch (error) {
    console.error("Error toggle list:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Přidání člena do listu
export async function addMember(req, res) {
  const { listId } = req.params;
  const { memberId } = req.body;
  const userId = req.userId;

  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }
  if (!ObjectId.isValid(memberId)) {
    return res.status(400).json({ message: "Bad request: Invalid member ID" });
  }

  let session;
  try {
    // Připojení k MongoDB a zahájení transakce
    await mongoclient.connect();
    session = mongoclient.startSession();
    session.startTransaction();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const member = await userCollection.findOne({ _id: ObjectId.createFromHexString(memberId) });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (list.memberList.includes(memberId)) {
      return res.status(400).json({ message: "Member already exists in the list" });
    }
    const listResult = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId) },
      { $addToSet: { memberList: memberId } },
      { session }
    );
    if (listResult.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to add member to the list" });
    }

    const memberResult = await userCollection.updateOne(
      { _id: ObjectId.createFromHexString(memberId) },
      { $addToSet: { membershipList: listId } },
      { session }
    );
    if (memberResult.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to add list to the user's memberships" });
    }

    await session.commitTransaction();
    res.status(200).json({listId: listId, memberId: memberId });
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(500).json({ message: "Failed to add member" });
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

// Odebrání člena z listu
export async function deleteMember(req, res) {
  const { listId } = req.params;
  const { memberId } = req.body;
  const userId = req.userId;
  
  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }
  if (!ObjectId.isValid(memberId)) {
    return res.status(400).json({ message: "Bad request: Invalid member ID" });
  }

  let session;
  try {
    await mongoclient.connect();
    session = mongoclient.startSession();
    session.startTransaction();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const member = await userCollection.findOne({ _id: ObjectId.createFromHexString(memberId) });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!list.memberList.includes(memberId)) {
      return res.status(400).json({ message: "Member not found in the list" });
    }
    const listResult = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId) },
      { $pull: { memberList: memberId } },
      { session }
    );
    if (listResult.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: "Failed to delete member from the list" });
    }

    const memberResult = await userCollection.updateOne(
      { _id: ObjectId.createFromHexString(memberId) },
      { $pull: { membershipList: listId } },
      { session }
    );
    if (memberResult.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to update user's membership" });
    }

    await session.commitTransaction();
    res.status(200).json({listId: listId, memberId: memberId });
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error delete member:", error);
    res.status(500).json({ message: "Failed to delete member" });
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

// Member opustí list //Není to stejný jako delete meber?
export async function leaveList(req, res) {
  const { listId } = req.params;
  const { memberId } = req.body;
  const userId = req.userId;
  
  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }
  if (!ObjectId.isValid(memberId)) {
    return res.status(400).json({ message: "Bad request: Invalid member ID" });
  }

  let session;
  try {
    await mongoclient.connect();
    session = mongoclient.startSession();
    session.startTransaction();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role !== "member") {
      return res.status(403).json({ message: "Access denied" });
    }

    const member = await userCollection.findOne({ _id: ObjectId.createFromHexString(memberId) });
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!list.memberList.includes(memberId)) {
      return res.status(400).json({ message: "Member not found in the list" });
    }
    const listResult = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId) },
      { $pull: { memberList: memberId } },
      { session }
    );
    if (listResult.modifiedCount === 0) {
      return res
        .status(400)
        .json({ error: "Failed to leave the list" });
    }

    const memberResult = await userCollection.updateOne(
      { _id: ObjectId.createFromHexString(memberId) },
      { $pull: { membershipList: listId } },
      { session }
    );
    if (memberResult.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to update user's membership" });
    }

    await session.commitTransaction();
    res.status(200).json({listId: listId, memberId: memberId });
  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    res.status(500).json({ message: "Failed to leave the list" });
  } finally {
    if (session) {
      session.endSession();
    }
  }
}


// Vytvoří novou položku v seznamu
export async function createItem(req, res) {
  const { listId } = req.params;
  const { name, count } = req.body;
  const userId = req.userId;

  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  try {
    await mongoclient.connect();

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role === "external") {
      return res.status(403).json({ message: "Access denied" });
    }

    const newItem = {
      itemId: nanoid(8), // Generování jedinečného itemId pomocí nanoid
      itemName: name,
      count: count,
      resolved: false,
    };

    const result = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId) },
      { $push: { itemList: newItem } }
    );
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to create item" });
    }

    res.status(200).json(newItem);
  } catch (error) {
    console.error("Error create item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Ostranění položky v seznamu
export async function deleteItem(req, res) {
  const { listId } = req.params;
  const { itemId } = req.body;
  const userId = req.userId;
  
  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  try {
    await mongoclient.connect(); 

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role === "external") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId) },
      { $pull: { itemList: { itemId: itemId } } }
    );
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to delete item" });
    }

    res.status(200).json({listId: listId, item: itemId});
  } catch (error) {
    console.error("Error delete item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Nastavení listu jako archivovaného
export async function toggleResolveItem(req, res) {
  const { listId } = req.params;
  const { itemId } = req.body;
  const userId = req.userId;

  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  try {
    await mongoclient.connect(); 

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role === "external") {
      return res.status(403).json({ message: "Access denied" });
    }

    const item = list.itemList.find(item => item.itemId === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }   

    const result = await listCollection.updateOne(
      { _id: ObjectId.createFromHexString(listId), "itemList.itemId": itemId },
      { $set: { "itemList.$.resolved": !item.resolved }}
    );
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to toggle item" });
    }

    res.status(200).json({listId: listId});
  } catch (error) {
    console.error("Error toggle resolve item:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

//Vrátí všechny nevyřešené položky
export async function getUnresolvedItems(req, res) {
  const { listId } = req.params;
  const userId = req.userId;

  if (!listId) {
    return res.status(400).json({ message: "Bad request: Missing list ID"});
  }
  if (!ObjectId.isValid(listId)) {
    return res.status(400).json({ message: "Bad request: Invalid list ID" });
  }

  try {
    await mongoclient.connect(); 

    const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const role = getRole(list, userId);
    if (role === "external") {
      return res.status(403).json({ message: "Access denied" });
    }

    const unresolvedItems = list.itemList.filter(item => item.resolved === false);
    if (unresolvedItems.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(unresolvedItems);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
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
    console.error("Error get all lists:", error);
    return res.status(500).json({ message: "Internal server error" });
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
    return res.status(500).json({ message: "Internal server error" });
  }
}
