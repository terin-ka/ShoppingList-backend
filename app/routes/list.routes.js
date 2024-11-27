import express from "express";
import {
    validateCreateList,
    validateUpdateList,
    validateAddMember,
    validateDeleteMember,
    validateCreateItem,
    validateDeleteItem,
  } from "../middleware/list.validation.js";
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
} from "../controllers/list.controller.js";

const router = express.Router();

router.get("/getList/:listId",authorize(), getList);
router.post("/create", authorize(), validateCreateList, createList);
router.delete("/delete/:listId", authorize(), deleteList);
router.patch("/update/:listId", authorize(), validateUpdateList, updateList);
router.patch("/toggleArchive/:listId", authorize(), toggleArchive);
router.post("/addMember/:listId", authorize(), validateAddMember, addMember);
router.delete("/deleteMember/:listId", authorize(), validateDeleteMember, deleteMember);
router.post("/leaveList/:listId", authorize(), leaveList);

router.post("/createItem/:listId", authorize(), validateCreateItem, createItem);
router.delete("/deleteItem/:listId", authorize(), validateDeleteItem, deleteItem);
router.patch("/toggleResolveItem/:listId", authorize(), toggleResolveItem);
router.get("/getUnresolvedItems/:listId", authorize(), getUnresolvedItems);

router.get("/getAll", authorize(), getAllLists);
router.get("/getArchived", authorize(), getArchivedLists);

export default router;
