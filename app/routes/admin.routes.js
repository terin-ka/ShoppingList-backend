import express from "express";
import { getAllUsers } from "../controllers/admin.controller.js";
import validateSession from "../middleware/validateSession.js";

const router = express.Router();

// validateAdmin spoléhá na fakt že bude spuštěn až po vykonání middleware validateBearer který naplní locals.user
// je nutno definovat ve správném pořadí
// middleware se vykonává v pořadí definice
router.use([validateSession.validateBearer, validateSession.validateCsrf, validateSession.validateAdmin]);

router.get("/users", getAllUsers);
export default router;
