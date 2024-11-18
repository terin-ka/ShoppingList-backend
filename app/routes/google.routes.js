import express from "express";
import {login,callback } from "../controllers/google.controller.js";

const router = express.Router();

router.get("/callback", callback);
router.get("/", login);

export default router;