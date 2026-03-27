import express from "express";
import { checkAuth, login, logout, register, updateProfile } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, checkAuth);
router.post("/logout", verifyToken, logout);
router.put("/profile", verifyToken, updateProfile);

export default router;
