import express from "express";
import { createUser, login, fundAccount, transferFunds, withdrawal, requireAuth} from '../controllers/userController';


const router = express.Router();

router.post('/create-user', createUser);
router.post('/login', login);
router.put('/fund/:AccountNo', requireAuth, fundAccount);
router.put('/transfer/:AccountNo', requireAuth, transferFunds)
router.put('/withdraw/:AccountNo', requireAuth, withdrawal)

export default router;
  