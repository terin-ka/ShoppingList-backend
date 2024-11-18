import express from "express";
import verifySignUp from "../middleware/verifySignUp.js";
import validateSession from "../middleware/validateSession.js";
import { register, login, logout, changePassword } from "../controllers/auth.controller.js";

const router = express.Router();

// router middleware - spouští se pro každý response
// router.use([validateSession.validateBearer]);

// register middleware kontroluje duplicitu jména
// session nekontrolujeme, pro register není nutno být přihlášen
router.post("/register", [verifySignUp.checkDuplicateUsername], register);

// session nekontrolujeme, pro login není nutno být přihlášen
router.post("/login", login);

// při logoutu bude session invalidována , musíme ji zpracovat v rámci middleware
router.post("/logout", [validateSession.validateBearer, validateSession.validateCsrf], logout);
router.post("/changepassword", [validateSession.validateBearer, validateSession.validateCsrf], changePassword);

export default router;
