import { NextFunction, Request, Response } from "express";
import { Schema, 
         SECRET_KEY 
      } from "../config/knexfile";
import jwt from 'jsonwebtoken';


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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { PhoneNumber, Firstname, Lastname, Username, Password } = req.body;
    const AccountNo = PhoneNumber.substring(1);

    const [userId] = await (await Schema)("users").insert({
      Firstname,
      Lastname,
      Username,
      PhoneNumber,
      Password,
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
    const owner = await getUserByAccountNo(req.params.AccountNo);

    if (!owner) {
      return res.status(404).json({ successful: false, message: "User not found" });
    }

    if (!Amount || isNaN(Amount)) {
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a number",
      });
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
    const sender = await getUserByAccountNo(req.params.AccountNo);
    const recipient = await getUserByAccountNo(to);

    if (!sender || !recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (sender.Balance < Amount) {
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
    const holder = await getUserByAccountNo(req.params.AccountNo);

    if (!holder) {
      return res.status(404).json({ message: "User not found" });
    }

    if (holder.Balance < Amount) {
      return res.send("Insufficient Funds");
    }

    if (!Amount || isNaN(Amount)) {
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a number",
      });
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
