import mongoclient, {
  userCollection,
  listCollection,
} from "../services/database.js";

export function getHello(_, res) {
  res.send("Hello");
};

// Vrací informace o listu na základě ID
export function getList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  res.status(200).json({
    message: "List retrieved successfully",
    data: { listId, userId },
  });
};

// Vrací potvrzení o vytvoření listu
export function createList(req, res) {
  const { name, isArchived } = req.body;
  const userId = req.userId;
  res.status(200).json({
    message: "List created successfully",
    data: { name, isArchived, userId },
  });
};

// Vrací potvrzení o smazání listu
export function deleteList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;
  res.status(200).json({
    message: "List deleted successfully",
    data: { listId, userId, userRole },
  });
};

// Vrací potvrzení o úpravě listu
export function updateList(req, res) {
  const { listId } = req.params;
  const { name } = req.body;
  const userId = req.userId;
  const userRole = req.userRole;
  res.status(200).json({
    message: "List updated successfully",
    data: { listId, name, userId, userRole },
  });
};

// Nastavení listu jako archivovaného
export function toggleArchive(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;
  res.status(200).json({
    message: "List toggled successfully",
    data: { listId, userId, userRole },
  });
};

// Přidání člena do listu
export function addMember(req, res) {
  const { listId } = req.params;
  const { memberId } = req.body;
  const userId = req.userId;
  const userRole = req.userRole;
  res.status(200).json({
    message: "Member added successfully",
    data: { listId, memberId, userId, userRole },
  });
};

// Odebrání člena z listu
export function deleteMember(req, res) {
  const { listId } = req.params;
  const { memberId } = req.body;
  const userId = req.userId;
  const userRole = req.userRole;
  res.status(200).json({
    message: "Member deleted successfully",
    data: { listId, memberId, userId, userRole },
  });
};

// Member opustí list
export function leaveList(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;
  res.status(200).json({
    message: "Member leave the list successfully",
    data: { listId, userId, userRole },
  });
};

// Vytvoří novou položku v seznamu
export function createItem(req, res) {
  const { listId } = req.params;
  const { name, count, resolved } = req.body;
  const userId = req.userId;
  res.status(200).json({
    message: "Item created successfully",
    data: { listId, name, count, resolved, userId },
  });
};

// Ostranění položky v seznamu
export function deleteItem(req, res) {
  const { listId } = req.params;
  const { itemId } = req.body;
  const userId = req.userId;
  res.status(200).json({
    message: "Item deleted successfully",
    data: { listId, itemId, userId },
  });
};

// Nastavení listu jako archivovaného
export function toggleResolveItem(req, res) {
  const { listId } = req.params;
  const userId = req.userId;
  res.status(200).json({
    message: "Item toggled successfully",
    data: { listId, userId },
  });
};

export function getUnresolvedItems(req, res) {
  const userId = req.userId;
  res.status(200).json({
    message: "All unresolved items retrieved successfully",
    data: { userId, lists:[] },
  });
};

// Vracení všech aktivních seznamů
export function getAllLists(req, res) {
  const userId = req.userId;
  res.status(200).json({
    message: "All active lists retrieved successfully",
    data: { userId, lists:[] },
  });
};

// Vracení všech archivovaných seznamů
export function getArchivedLists(req, res) {
  const userId = req.userId;
  res.status(200).json({
    message: "All archived lists retrieved successfully",
    data: { userId, lists:[] }, // Prozatím prázdný seznam
  });
};
