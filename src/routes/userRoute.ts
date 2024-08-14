import express from "express";
import { createUser, login } from '../controllers/userController';
import { checkKarmaBlacklist } from "../middlewares/authMiddleware";

const router = express.Router();


router.post('/create-user', checkKarmaBlacklist, createUser);
router.post('/login', login);


export default router;