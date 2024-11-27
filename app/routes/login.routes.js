import express from "express";
import { getAllUsers } from "../controllers/login.controller.js";

const router = express.Router();
router.get("/getAll", getAllUsers);

export default router;
