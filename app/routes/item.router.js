import express from "express";
import { createItem, deleteItem, setItemResolved, getUnresolvedItems } from "../controllers/item.controller.js";
const router = express.Router();

router.post("/create", createItem);
router.delete("/:id", deleteItem);
router.post("/:id/resolve", setItemResolved);
router.get("/unresolved", getUnresolvedItems);

export default router;