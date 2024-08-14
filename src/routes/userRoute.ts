import express from "express";
import { createUser, login } from '../controllers/userController';
import { checkKarmaBlacklist } from "../middlewares/authMiddleware";

const router = express.Router();


/**
 * @openapi
 * /create-user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PhoneNumber:
 *                 type: string
 *                 description: The phone number of the user "+2341234567890"
 *               Firstname:
 *                 type: string
 *                 description: The first name of the user
 *               Lastname:
 *                 type: string
 *                 description: The last name of the user
 *               Username:
 *                 type: string
 *                 description: The username of the user
 *               Password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: "Account created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     Id:
 *                       type: integer
 *                     Firstname:
 *                       type: string
 *                     Lastname:
 *                       type: string
 *                     Username:
 *                       type: string
 *                     PhoneNumber:
 *                       type: string
 *                     Password:
 *                       type: string
 *                     AccountNo:
 *                       type: string
 *                     Balance:
 *                       type: number
 *       409:
 *         description: User already exists
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
 *                   example: "User already exists"
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
router.post('/create-user', checkKarmaBlacklist, createUser);

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Authenticate a user and generate a session token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Username:
 *                 type: string
 *                 description: The username of the user
 *                 example: john_doe
 *               Password:
 *                 type: string
 *                 description: The password of the user
 *                 example: secret_password
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: "Login successful"
 *       400:
 *         description: Missing Username or Password
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
 *                   example: "Username and Password are required"
 *       401:
 *         description: Invalid Username or Password
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
 *                   example: "Invalid Username or Password"
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
router.post('/login', login);


export default router;
