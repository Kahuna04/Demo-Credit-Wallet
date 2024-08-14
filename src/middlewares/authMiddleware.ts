import axios from "axios";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import { SECRET_KEY } from "../config/knexfile";
import * as jwt from "jsonwebtoken";
import { ADJUTOR_API_URL, ADJUTOR_API_TOKEN } from "../config/knexfile";

export const checkKarmaBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info("authMiddleware.checkKarmaBlacklist(): Function Entry");
  logger.info("Request body in checkKarmaBlacklist:", req.body); 
  const { PhoneNumber } = req.body;

  try {
    const response = await axios.get(`${ADJUTOR_API_URL}/${PhoneNumber}`, {
      headers: {
        Authorization: `Bearer ${ADJUTOR_API_TOKEN}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      logger.warn("User is blacklisted in checkKarmaBlacklist", { PhoneNumber });
      return res.status(403).json({
        successful: false,
        message: "You cannot register an account with us currently. Please contact support.",
      });
    }

    next();
  } catch (error: any) {
    if (
      error.response &&
      error.response.status === 404 &&
      error.response.data.message === "Identity not found in karma"
    ) {
      logger.info("User not blacklisted in checkKarmaBlacklist", { PhoneNumber });
      next();
    } else {
      logger.error("Error checking blacklist in checkKarmaBlacklist", { PhoneNumber, error: error.message });
      res.status(500).json({ successful: false, message: "Error checking blacklist", error });
    }
  } finally {
    logger.info("checkKarmaBlacklist(): Function Exit");
  } 
};

export const handleAuth = (user: string) => {
  if (!SECRET_KEY) {
    logger.error("SECRET_KEY is undefined in handleAuth");
    throw new Error("SECRET_KEY is undefined");
  }
  logger.info("JWT generated in handleAuth", { user });
  return jwt.sign({ PhoneNumber: user }, SECRET_KEY , {expiresIn: '1h' });
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; 
  if (!token) {
    logger.warn("Unauthenticated user in requireAuth");
    return res.status(401).json({ successful: false, message: "Unauthenticated user" });
  }

  if (!SECRET_KEY) {
    logger.error("SECRET_KEY is undefined in requireAuth");
    throw new Error("SECRET_KEY is undefined");
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      logger.error("Token verification failed in requireAuth", { error: err.message });
      return res.status(401).json({
        successful: false,
        message: "Token verification failed",
        error: err.message,
      });
    }
    logger.info("Token verified successfully in requireAuth", { decoded });
    next();
  });
};
