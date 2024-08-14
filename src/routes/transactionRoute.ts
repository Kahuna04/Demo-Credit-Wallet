import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { fundAccount, transferFunds, withdrawal } from '../controllers/transactionController';

const router = express.Router();

/**
 * @openapi
 * /fund/{AccountNo}:
 *   put:
 *     summary: Fund a user's account
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: AccountNo
 *         schema:
 *           type: string
 *         required: true
 *         description: The account number of the user to fund
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Amount:
 *                 type: number
 *                 description: The amount to fund the account with
 *                 example: 100.00
 *     responses:
 *       201:
 *         description: Account funded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account funded successfully"
 *       400:
 *         description: Invalid amount provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Amount is required and must be a positive number"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An Internal server error occurred"
 */
router.put('/fund/:AccountNo', requireAuth, fundAccount);

/**
 * @openapi
 * /transfer/{AccountNo}:
 *   put:
 *     summary: Transfer funds between accounts
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: AccountNo
 *         schema:
 *           type: string
 *         required: true
 *         description: The sender's account number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Amount:
 *                 type: number
 *                 description: The amount to transfer
 *                 example: 100.00
 *               to:
 *                 type: string
 *                 description: The recipient's account number
 *                 example: "0987654321"
 *     responses:
 *       200:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transfer successful"
 *       400:
 *         description: Invalid amount or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Amount is required and must be a positive number, Insufficient balance, Cannot transfer to own account"
 *       404:
 *         description: Sender or recipient not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An internal server error occurred"
 */
router.put('/transfer/:AccountNo', requireAuth, transferFunds);

/**
 * @openapi
 * /withdraw/{AccountNo}:
 *   put:
 *     summary: Withdraw funds from a user's account
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: AccountNo
 *         schema:
 *           type: string
 *         required: true
 *         description: The account number of the user withdrawing funds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Amount:
 *                 type: number
 *                 description: The amount to withdraw
 *                 example: 100
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Withdrawal successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     AccountNo:
 *                       type: string
 *                       example: "1234567890"
 *                     Balance:
 *                       type: number
 *                       example: 900.00
 *       400:
 *         description: Invalid amount provided or insufficient balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Amount is required and must be a positive number"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 successful:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An Internal server error occurred"
 */
router.put('/withdraw/:AccountNo', requireAuth, withdrawal);

export default router;
