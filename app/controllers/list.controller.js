import mongoclient, {
  userCollection,
  listCollection,
} from "../services/database.js";

async function getRole(listId, userId) {
  try {
    await mongoclient.connect();
    if (!listId) {
      throw new Error("Bad request: Missing list ID");
    }

    const shoppingList = await listCollection.findOne({ listId });

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

export function getHello(_, res) {
  res.send("Hello");
}

// Vrací informace o listu na základě ID
export async function getList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;

  try {
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }
    res.status(200).json({
      message: "List retrieved successfully",
      data: { listId },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Vrací potvrzení o vytvoření listu
export async function createList(req, res) {
  const { name } = req.body;
  const userId = req.userId;
  res.status(200).json({
    message: "List created successfully",
    data: { name, userId },
  });
}

// Vrací potvrzení o smazání listu
export async function deleteList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;

  try {
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "List deleted successfully",
      data: { listId, userId },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Vrací potvrzení o úpravě listu
export async function updateList(req, res) {
  const { listId } = req.params;
  const { name } = req.body;
  const userId = req.userId;
  try {
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "List updated successfully",
      data: { listId, name, userId },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Přepínání vlastnosti archive
export async function toggleArchive(req, res) {
  const { listId } = req.params;
  const userId = req.userId;

  try {
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "List toggled successfully",
      data: { listId, userId },
    });
  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Přidání člena do listu
export async function addMember(req, res) {
  const { listId } = req.params;
  const { memberId } = req.body;
  const userId = req.userId;

  try {
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "Member added successfully",
      data: { listId, memberId, userId},
    });

  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Odebrání člena z listu
export async function deleteMember(req, res) {
  const { listId } = req.params;
  const { memberId } = req.body;
  const userId = req.userId;
  
  try {
    const role = await getRole(listId, userId);
    if (role !== "owner") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "Member deleted successfully",
      data: { listId, memberId, userId },
    });

  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Member opustí list
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

  try {
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "Item created successfully",
      data: { listId, name, count, userId },
    });

  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Ostranění položky v seznamu
export async function deleteItem(req, res) {
  const { listId } = req.params;
  const { itemId } = req.body;
  const userId = req.userId;

  try {
    const role = await getRole(listId, userId);
    if (role === "external") {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "Item deleted successfully",
      data: { listId, itemId, userId },
    });

  } catch (error) {
    if (error.message === "List not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
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
  res.status(200).json({
    message: "All active lists retrieved successfully",
    data: { userId, lists: [] },
  });
}

// Vracení všech archivovaných seznamů
export async function getArchivedLists(req, res) {
  const userId = req.userId;
  res.status(200).json({
    message: "All archived lists retrieved successfully",
    data: { userId, lists: [] }, // Prozatím prázdný seznam
  });
}
