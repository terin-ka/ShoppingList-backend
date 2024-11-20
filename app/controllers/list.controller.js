import mongoclient, { userCollection, listCollection } from "../services/database.js";

export const getHello = (_, res) => {
    res.send("Hello");
  };

export const getList = (req, res) => {
    const { id } = req.params;
    // Vrací informace o listu na základě ID
    res.status(200).json({
      message: "List retrieved successfully",
      data: { id },
    });
  };
  
  export const createList = (req, res) => {
    const { name, isArchived } = req.body;
    // Vrací potvrzení o vytvoření listu
    res.status(200).json({
      message: "List created successfully",
      data: { name, isArchived },
    });
  };
  
  export const deleteList = (req, res) => {
    const { id } = req.params;
    // Vrací potvrzení o smazání listu
    res.status(200).json({
      message: "List deleted successfully",
      data: { id },
    });
  };
  
  export const updateList = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    // Vrací potvrzení o úpravě listu
    res.status(200).json({
      message: "List updated successfully",
      data: { id, name },
    });
  };
  
  export const setListArchived = (req, res) => {
    const { id } = req.params;
    // Nastavení listu jako archivovaného
    res.status(200).json({
      message: "List archived successfully",
      data: { id },
    });
  };
  
  export const addMember = (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;
    // Přidání člena do listu
    res.status(200).json({
      message: "Member added successfully",
      data: { id, memberId },
    });
  };
  
  export const getAllLists = (req, res) => {
    // Vracení všech aktivních seznamů
    res.status(200).json({
      message: "All active lists retrieved successfully",
      data: [], // Prozatím prázdný seznam
    });
  };
  
  export const getArchivedLists = (req, res) => {
    // Vracení všech archivovaných seznamů
    res.status(200).json({
      message: "All archived lists retrieved successfully",
      data: [], // Prozatím prázdný seznam
    });
  };
  