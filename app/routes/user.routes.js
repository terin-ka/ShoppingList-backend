import express from "express";
import { getUser, getUserProfile, changeEmail } from "../controllers/user.controller.js";
import validateSession from "../middleware/validateSession.js";

const router = express.Router();

router.use([validateSession.validateBearer, validateSession.validateCsrf]);

router.get("/profile/:id", getUserProfile);
router.get("/user/:id", getUser);
router.post("/changeemail", changeEmail);

export default router;
