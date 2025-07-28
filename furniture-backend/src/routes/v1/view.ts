import express from "express";

const router = express.Router();
import { home } from "../../controllers/web/viewControllers";

router.get("/home", home);

export default router;
