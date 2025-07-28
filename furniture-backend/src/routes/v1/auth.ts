import express from "express";
import {
  register,
  verifyOtp,
  confirmPassword,
  login,
} from "../../controllers/authControllers";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/confirm-password", confirmPassword);
router.post("/login", login);
export default router;
