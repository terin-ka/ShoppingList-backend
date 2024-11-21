import express from "express";
import {
    validateCreateList,
    validateUpdateList,
    validateAddMember,
    validateDeleteMember,
    validateCreateItem,
    validateDeleteItem,
  } from "../middleware/validation/list.validation.js";
import { authorize } from "../middleware/authorization.js";
import { 
  getList, 
  createList, 
  deleteList, 
  updateList, 
  toggleArchive,
  addMember, 
  deleteMember, 
  leaveList, 
  createItem,
  deleteItem,
  toggleResolveItem,
  getUnresolvedItems,
  getAllLists, 
  getArchivedLists, 
  getHello,
} from "../controllers/list.controller.js";

const router = express.Router();

router.get("/", getHello);

router.get("/:listId", authorize(), getList);
router.post("/create", authorize(null, false), validateCreateList, createList);
router.delete("/:listId", authorize("owner"), deleteList);
router.patch("/:listId", authorize("owner"), validateUpdateList, updateList);
router.patch("/:listId/archive", authorize("owner"), toggleArchive);
router.post("/:listId/addMember", authorize("owner"), validateAddMember, addMember);
router.post("/:listId/deleteMember", authorize("owner"), validateDeleteMember, deleteMember);
router.post("/:listId/leaveList", authorize("member"), leaveList);

router.post("/:listId/createItem", authorize(), validateCreateItem, createItem);
router.post("/:listId/deleteItem", authorize(), validateDeleteItem, deleteItem);
router.patch("/:listId/resolveItem", authorize(), toggleResolveItem);
router.get("/:listId/get/unresolved", authorize(), getUnresolvedItems);

router.get("/get/all", authorize(null, false), getAllLists);
router.get("/get/archived", authorize(null, false), getArchivedLists);

export default router;

/*
router.get("/:listId", authorize(), getList);
router.post("/", authorize(null, false), validateCreateList, createList); // Bez "create" v URL
router.delete("/:listId", authorize("owner"), deleteList);
router.patch("/:listId", authorize("owner"), validateUpdateList, updateList);
router.patch("/:listId/archive", authorize("owner"), toggleArchive);

router.post("/:listId/members", authorize("owner"), validateAddMember, addMember); // Add member
router.delete("/:listId/members", authorize("owner"), validateDeleteMember, deleteMember); // Delete member
router.post("/:listId/members/leave", authorize("member"), leaveList); // Leave list

router.post("/:listId/items", authorize(), validateCreateItem, createItem); // Create item
router.delete("/:listId/items", authorize(), validateDeleteItem, deleteItem); // Delete item
router.patch("/:listId/items/resolve", authorize(), toggleResolveItem); // Resolve item
router.get("/:listId/items/unresolved", authorize(), getUnresolvedItems); // Get unresolved items

router.get("/lists", authorize(null, false), getAllLists); // Get all lists
router.get("/lists/archived", authorize(null, false), getArchivedLists); // Get archived lists
*/