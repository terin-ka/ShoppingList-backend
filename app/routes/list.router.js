import express from "express";
import {
    validateCreateList,
    validateUpdateList,
  } from "../middleware/validation/index.js";
import { getList, createList, deleteList, updateList, setListArchived, addMember, getAllLists, getArchivedLists, getHello } from "../controllers/list.controller.js";
const router = express.Router();

router.get("/l", getHello);
router.get("/:id", getList);
router.post("/create",validateCreateList, createList);
router.delete("/:id", deleteList);
router.patch("/:id",validateUpdateList, updateList);
router.patch("/:id/archive", setListArchived);
router.post("/:id/addMember", addMember);
router.get("/get/all", getAllLists);
router.get("/get/archived", getArchivedLists);

export default router;