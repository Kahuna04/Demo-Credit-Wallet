import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { fundAccount, transferFunds, withdrawal } from '../controllers/transactionController';

const router = express.Router();

router.put('/fund/:AccountNo', requireAuth, fundAccount);
router.put('/transfer/:AccountNo', requireAuth, transferFunds)
router.put('/withdraw/:AccountNo', requireAuth, withdrawal)

export default router;