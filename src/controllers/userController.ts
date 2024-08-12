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
    return res.status(401).json({ message: "Unauthenticated user" });
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

const checkKarmaBlacklist = async (PhoneNumber: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      `https://adjutor.lendsqr.com/v2/verification/karma/${PhoneNumber}`,
      {
        headers: {
          Authorization: `Bearer ${ADJUTOR_API_TOKEN}`,
        },
      }
    );

    // If the response contains valid karma data, assume the user is blacklisted
    return response.data && response.data.karma_identity ? true : false;
  } catch (error) {
    console.error('Error checking Karma blacklist:', error.response?.data || error.message);
    throw new Error('Could not verify blacklist status');
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { PhoneNumber, Firstname, Lastname, Username, Password } = req.body;
    const AccountNo = PhoneNumber.substring(1);
  
    // Check if the PhoneNumber is in the Lendsqr Adjutor Karma blacklist
    const isBlacklisted = await checkKarmaBlacklist(PhoneNumber);
    if (isBlacklisted) {
      return res.status(400).json({
        successful: false,
        message: "User is blacklisted and cannot be onboarded",
      });
    }
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
  } catch (error: any) {
    res.status(500).send(error.message);
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
  } catch (error: any) {
    res.status(500).send(error.message);
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
      return res.status(404).json({ message: "User not found" });
    }

    if (sender.Balance < parseFloat(Amount)) {
      return res.send("Insufficient Funds");
    }

    if (sender.AccountNo === recipient.AccountNo) {
      return res.send("Cannot transfer to own account");
    }

    await updateBalance(sender.AccountNo, -parseFloat(Amount));
    await updateBalance(recipient.AccountNo, parseFloat(Amount));

    res.send("Transfer Successful");
  } catch (error: any) {
    res.status(500).send(error.message);
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
      return res.status(404).json({ message: "User not found" });
    }

    if (parseFloat(Amount) > parseFloat(holder.Balance)) {
      return res.send("Insufficient Funds");
    }

    await updateBalance(holder.AccountNo, -parseFloat(Amount));

    const updatedUser = await getUserByAccountNo(req.params.AccountNo);
    res.status(201).json({
      successful: true,
      message: "Withdrawal successful",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { Username, Password } = req.body;
    const user = await (await Schema)("users").where({ Username, Password }).first();

    if (!user) {
      return res.status(401).json({
        successful: false,
        message: "Invalid Username or Password",
      });
    }

    const token = handleAuth(user.PhoneNumber);
    res.cookie(user.AccountNo, token);

    res.status(201).json({
      successful: true,
      message: "Login successful",
    });
  } catch (error: any) {
    res.status(500).send(error.message);
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
