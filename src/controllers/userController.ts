import { NextFunction, Request, Response } from "express";
import Schema from "../config/knexfile";
import jwt from 'jsonwebtoken';


const handleauth = ( user: string ) => {
  const token = jwt.sign({ PhoneNumber: user }, 'secret');
  return token;
};
export const requireauth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[req.params.AccountNo];
  if (!token){
    return res.send ("Unauthenticated user")
  };
  jwt.verify(token, 'secret', (err: any, decode: any) => {
     if (err) {
       return res.status(401).json({
          successful: false,
          message: "Token verification failed",
          error: err.message,
        });
      }else {
        next ()
        console.log(decode)
      } 

  });
  
};


export const createUser = async (req: Request, res: Response) => {
  try {

    const Numb:string = req.body.PhoneNumber
    let x = Numb.split("")
    let j = "";
    for (let i = 1; i < x.length; i++){
        j = j+x [i]
    };
    const [userId] =  await (await Schema)("users").insert({
      Firstname: req.body.Firstname,
      Lastname: req.body.Lastname,
      Username: req.body.Username, 
      PhoneNumber: req.body.PhoneNumber,
      Password: req.body.Password,
      AccountNo: j,
      Balance: 0.00
    });

    const newUser = await (await Schema)("users").where('Id', userId).first();
    //res.cookie("jwt", handleauth(newUser.PhoneNumber))
    res.status(201).json({
      successful: true,
      message: "Account created successfully",
      data: newUser,
      });
    
  } catch (error: any) {

    res.status(500).send (error.message)
 }
};

export const fundAccount = async (req: Request, res: Response )=>{
  const owner = await (await Schema)("users").where('AccountNo', req.params.AccountNo).first(); 
  const {Amount} = req.body;

  if (!Amount || isNaN(Amount)) {
    return res.status(400).json({
      successful: false,
      message: "Amount is required and must be a number",
    });
  }

  let upgrade = parseInt(owner.Balance) + parseFloat(Amount);
  await (await Schema)("users").update({"Balance": upgrade}).where({"AccountNo": req.params.AccountNo});

  res.status(201).json({
    successful: true,
    message: "Account funded successfully",
    });
    if (!owner) {
      return res.status(404).json({
        successful: false,
        message: "User not found",
      });
   }
};

export const transferfunds = async (req: Request, res: Response )=>{
  const sender = await (await Schema)("users").where('AccountNo', req.params.AccountNo).first();
  const {Amount, to} = req.body

  if (sender.Balance < Amount){
    return res.send ("Insufficient Fund")
  } 
  const recipient = await (await Schema)("users").where('AccountNo', to).first();
  if (!recipient){
    return res.send ("Invalid Account Number")
  }
  if (sender.AccountNo == recipient.AccountNo){
    return res.send ("Cannot transfer to own account")
  }
  let upgrade = parseInt(recipient.Balance) + parseFloat(Amount)
  await (await Schema)("users").update({"Balance": upgrade }).where({"AccountNo": to}
  );
  let loss = parseInt(sender.Balance) - parseFloat(Amount)
  await (await Schema)("users").update({"Balance": loss }).where({"AccountNo": req.params.AccountNo});
  res.send ("Transfer Successful")
};

export const withdrawal = async (req: Request, res: Response )=>{
  const holder = await (await Schema)("users").where('AccountNo', req.params.AccountNo).first(); 
  const {Amount} = req.body;

  if (holder.Balance < Amount){
   return res.send ("Insufficient Fund")
  }

  if (!Amount || isNaN(Amount)) {
    return res.status(400).json({
      successful: false,
      message: "Amount is required and must be a number",
    });
  }

  let upgrade = parseInt(holder.Balance) - parseFloat(Amount);
  await (await Schema)("users").update({"Balance": upgrade}).where({"AccountNo": req.params.AccountNo});
  const num = await (await Schema)("users").where('AccountNo', req.params.AccountNo).first();
  res.status(201).json({
    successful: true,
    message: "Withdrawal successfully",
    data: num,
    });
    if (!holder) {
      return res.status(404).json({
        successful: false,
        message: "Withdrawal not successful",
      });
   }
};


export const login = async (req: Request, res: Response) => {
  try {
  
    const {Username, Password} = req.body

    const User = await (await Schema)("users").where('Password', Password).first();
    if (Username != User.Username && Password != User.Password){
      return res.send ("Invalid Username or Password")
    }
    res.cookie(User.AccountNo, handleauth(User.PhoneNumber))
    res.status(201).json({
      successful: true,
      message: "Login successful",
      });
    
  } catch (error: any) {

    res.status(500).send (error.message)
 }
};