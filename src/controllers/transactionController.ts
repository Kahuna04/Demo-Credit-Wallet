import { Request, Response } from "express";
import { Schema } from "../config/knexfile";
import logger from "../config/logger";

export const fundAccount = async (req: Request, res: Response) => {
  try {
    const { Amount } = req.body;
    if (!Amount || isNaN(Amount) || parseFloat(Amount) <= 0) {
      logger.warn("Invalid Amount provided for funding");
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a positive number",
      });
    }

    const owner = await getUserByAccountNo(req.params.AccountNo);
    if (!owner) {
      logger.warn(`User not found for AccountNo: ${req.params.AccountNo}`);
      return res.status(404).json({ successful: false, message: "User not found" });
    }

    const updatedBalance = parseInt(owner.Balance) + parseFloat(Amount);
    await (await Schema)("users").update({ Balance: updatedBalance }).where({ AccountNo: req.params.AccountNo });

    logger.info(`Account funded successfully for AccountNo: ${req.params.AccountNo}`);
    res.status(201).json({
      successful: true,
      message: "Account funded successfully",
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`fundAccount error: ${err.message}`);
    res.status(500).json({
      successful: false,
      message: "An Internal server error occurred",
    });
  }
};

export const transferFunds = async (req: Request, res: Response) => {
  try {
    const { Amount, to } = req.body;
    if (!Amount || isNaN(Amount) || parseFloat(Amount) <= 0) {
      logger.warn("Invalid Amount provided for transfer");
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a positive number",
      });
    }

    const sender = await getUserByAccountNo(req.params.AccountNo);
    const recipient = await getUserByAccountNo(to);

    if (!sender || !recipient) {
      logger.warn(`User not found for AccountNo: ${req.params.AccountNo} or recipient: ${to}`);
      return res.status(404).json({ successful: false, message: "User not found" });
    }

    if (sender.Balance < parseFloat(Amount)) {
      logger.warn(`Insufficient balance for AccountNo: ${req.params.AccountNo}`);
      return res.status(400).json({
        successful: false,
        message: "Insufficient balance",
      });
    }

    if (sender.AccountNo === recipient.AccountNo) {
      logger.warn(`Transfer to own account attempted by AccountNo: ${req.params.AccountNo}`);
      return res.status(400).json({
        successful: false,
        message: "Cannot transfer to own account",
      });
    }

    await updateBalance(sender.AccountNo, -parseFloat(Amount));
    await updateBalance(recipient.AccountNo, parseFloat(Amount));

    logger.info(`Transfer successful from AccountNo: ${req.params.AccountNo} to AccountNo: ${to}`);
    res.status(200).json({
      successful: true,
      message: "Transfer successful",
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`transferFunds error: ${err.message}`);
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
      logger.warn("Invalid Amount provided for withdrawal");
      return res.status(400).json({
        successful: false,
        message: "Amount is required and must be a positive number",
      });
    }

    const holder = await getUserByAccountNo(req.params.AccountNo);

    if (!holder) {
      logger.warn(`User not found for AccountNo: ${req.params.AccountNo}`);
      return res.status(404).json({ successful: false, message: "User not found" });
    }

    if (parseFloat(Amount) > parseFloat(holder.Balance)) {
      logger.warn(`Insufficient balance for withdrawal for AccountNo: ${req.params.AccountNo}`);
      return res.status(400).json({
        successful: false,
        message: "Insufficient balance",
      });
    }

    await updateBalance(holder.AccountNo, -parseFloat(Amount));

    const updatedUser = await getUserByAccountNo(req.params.AccountNo);
    logger.info(`Withdrawal successful for AccountNo: ${req.params.AccountNo}`);
    res.status(200).json({
      successful: true,
      message: "Withdrawal successful",
      data: updatedUser,
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`withdrawal error: ${err.message}`);
    res.status(500).json({
      successful: false,
      message: 'An Internal server error occurred',
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
