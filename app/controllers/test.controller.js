
// Smazání listu
export async function deleteList(req, res) {
    const { listId } = req.params;
    const userId = req.userId;
  
    if (!listId) {
      return res.status(400).json({ error: "Bad request: Missing list ID"});
    }
    if (!ObjectId.isValid(listId)) {
      return res.status(400).json({ error: "Bad request: Invalid list ID" });
    }
  
    try {
      await mongoclient.connect();
  
      const list = await listCollection.findOne({ _id: ObjectId.createFromHexString(listId) });
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }
  
      const role = getRole(list, userId);
      if (role !== "owner") {
        return res.status(403).json({ error: "Access denied" });
      }
  
      const result = await listCollection.deleteOne({_id: ObjectId.createFromHexString(listId),});
      if (result.deletedCount === 0) {
        return res.status(400).json({ error: "Failed to delete list" });
      }
  
      res.status(200).json({listId: listId});
    } catch (error) {
      console.error("Error deleting list:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }