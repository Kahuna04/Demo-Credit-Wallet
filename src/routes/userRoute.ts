import express from "express";
import { createUser, login, fundAccount, transferfunds, withdrawal, requireauth} from '../controllers/userController';


const router = express.Router();

router.post('/create-user', createUser);
router.post('/login', login);
router.put('/fund/:AccountNo', requireauth, fundAccount);
router.put('/transfer/:AccountNo', requireauth, transferfunds)
router.put('/withdraw/:AccountNo', requireauth, withdrawal)

export default router;
  