import { Request, Response } from "express";
import { Schema } from "../config/knexfile";
import { handleAuth } from "../middlewares/authMiddleware";
import bcrypt from 'bcrypt';
import logger from "../config/logger";


export const createUser = async (req: Request, res: Response) => {
  try {
    const { 
      PhoneNumber, 
      Firstname, 
      Lastname, 
      Username, 
      Password
     } = req.body;
    logger.info("Creating user in createUser", { PhoneNumber, Username });
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

function next() {
  throw new Error('Function not implemented.');
}
