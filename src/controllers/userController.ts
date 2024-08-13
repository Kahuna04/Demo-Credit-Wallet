import axios from 'axios';
import { NextFunction, Request, Response } from "express";
import { Schema, 
         SECRET_KEY,
         ADJUTOR_API_TOKEN
      } from "../config/knexfile";
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const handleAuth = (user: string) => {
  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is undefined");
  }
    return jwt.sign({ PhoneNumber: user }, SECRET_KEY);
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[req.params.AccountNo];
  if (!token) {
    return res.status(401).json({ successful: false, message: "Unauthenticated user" });
  }

  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is undefined");
  }

  jwt.verify(token, SECRET_KEY, (err: any, decode: any) => {
    if (err) {
      return res.status(401).json({
        successful: false,
        message: "Token verification failed",
        error: err.message,
      });
    }
    console.log(decode);
    next();
  });
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { PhoneNumber, Firstname, Lastname, Username, Password } = req.body;
    const AccountNo = PhoneNumber.substring(4);
    const hashedPassword = await bcrypt.hash(Password, 10);
    const [userId] = await (await Schema)("users").insert({
      Firstname,
      Lastname,
      Username,
      PhoneNumber,
      Password: hashedPassword,
      AccountNo,
      Balance: 0.00,
    });

    const newUser = await (await Schema)("users").where('Id', userId).first();

    res.status(201).json({
      successful: true,
      message: "Account created successfully",
      data: newUser,
    });
  } catch (error) {
    const err = error as Error;
    console.log("error", err.message)
    res.status(500).json({
      successful: false,
      message: 'An Internal server error ocurred',
    });
  }
};

export const fundAccount = async (req: Request, res: Response) => {
  try {
    const { Amount } = req.body;
    if (!Amount || isNaN(Amount) || parseFloat(Amount) <= 0) {
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a positive number",
      });
    }

    const owner = await getUserByAccountNo(req.params.AccountNo);
    if (!owner) {
      return res.status(404).json({ successful: false, message: "User not found" });
    }

    const updatedBalance = parseInt(owner.Balance) + parseFloat(Amount);
    await (await Schema)("users").update({ Balance: updatedBalance }).where({ AccountNo: req.params.AccountNo });

    res.status(201).json({
      successful: true,
      message: "Account funded successfully",
    });
  } catch (error) {
    const err = error as Error;
    console.log("funderror", err.message)
    res.status(500).json({
      successful: false,
      message: "An Internal server error ocurred",
    });
  }
};

export const transferFunds = async (req: Request, res: Response) => {
  try {
    const { Amount, to } = req.body;
    if (!Amount || isNaN(Amount) || parseFloat(Amount) <= 0) {
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a positive number",
      });
    }

    const sender = await getUserByAccountNo(req.params.AccountNo);
    const recipient = await getUserByAccountNo(to);

    if (!sender || !recipient) {
      return res.status(404).json({ successful: false, message: "User not found" });
    }

    if (sender.Balance < parseFloat(Amount)) {
      return res.status(400).json({
        successful: false,
        message: "Insufficient balance",
      });
    }

    if (sender.AccountNo === recipient.AccountNo) {
      return res.status(400).json({
        successful: false,
        message: "Cannot transfer to own account",
      });
    }

    await updateBalance(sender.AccountNo, -parseFloat(Amount));
    await updateBalance(recipient.AccountNo, parseFloat(Amount));

    res.status(200).json({
      successful: true,
      message: "Transfer successful",
    });
  } catch (error) {
    const err = error as Error;
    console.log("transfererror", err.message)
    res.status(500).json({
      successful: false,
      message: 'An Internal server error occurred',
    });
  }
};

export const withdrawal = async (req: Request, res: Response) => {
  try {
    const { Amount } = req.body;
    if (!Amount || isNaN(Amount) || parseFloat(Amount) <= 0) {
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a positive number",
      });
    }

    const holder = await getUserByAccountNo(req.params.AccountNo);

    if (!holder) {
      return res.status(404).json({ successful: false, message: "User not found" });
    }

    if (parseFloat(Amount) > parseFloat(holder.Balance)) {
      return res.status(400).json({
        successful: false,
        message: "Insufficient balance",
      });
    }

    await updateBalance(holder.AccountNo, -parseFloat(Amount));

    const updatedUser = await getUserByAccountNo(req.params.AccountNo);
    res.status(200).json({
      successful: true,
      message: "Withdrawal successful",
      data: updatedUser,
    });
  } catch (error) {
    const err = error as Error;
    console.log("withdrawalerror", err.message)
    res.status(500).json({
      successful: false,
      message: 'An Internal server error occurred',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({
        successful: false,
        message: "Username and Password are required",
      });
    }
    const user = await (await Schema)("users").where({ Username }).first();
    if (!user) {
      return res.status(401).json({
        successful: false,
        message: "Invalid Username or Password",
      });
    }
    const isPasswordMatch = await bcrypt.compare(Password, user.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        successful: false,
        message: "Invalid Username or Password",
      });
    }
    const token = handleAuth(user.PhoneNumber);
    if (!token) {
      return res.status(500).json({
        successful: false,
        message: "Failed to generate authentication token",
      });
    }
    res.cookie(user.AccountNo, token);
    return res.status(200).json({
      successful: true,
      message: "Login successful",
    });
  } catch (error) {
    const err = error as Error;
    console.log("Login error:", err.message);
    return res.status(500).json({
      successful: false,
      message: "An internal server error occurred",
    });
  }
};

const getUserByAccountNo = async (AccountNo: string) => {
  return await (await Schema)("users").where({ AccountNo }).first();
};

const updateBalance = async (AccountNo: string, Amount: number) => {
  const user = await getUserByAccountNo(AccountNo);
  const updatedBalance = parseInt(user.Balance) + Amount;
  await (await Schema)("users").update({ Balance: updatedBalance }).where({ AccountNo });
};
