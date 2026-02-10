import type { Request ,Response} from "express";
import z, { date, string, success } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from "../db/prisma.js";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import 'dotenv/config'



const registercreateUser = z.object({
  username: z.string({error: "username is required"}).trim().min(3 ,{error: "Required"}),
  password: z.string({error: "passwoed is required"}).trim().min(6 ,{error: "String must contain at least 6 character(6)"}),
  role: z.enum(['doctor','patient'],{error:"Invalid enum value. Expected 'DOCTOR' | 'PATIENT'"})
})
const loginSchema = z.object({
  username: z.string('Username is required').min(3 , 'username is required').trim(),
  password: z.string('password is required').min(3 , 'username is required').trim(),
})

async function register(req: Request , res: Response) {
  try{
    const data = registercreateUser.parse(req.body)
    data.password = await bcrypt.hash(data.password,12)
    console.log(data)
  
    const createUser = await prisma.user.create({
      data:{
        username: data.username,
        password: data.password,
        role: data.role
      },
      select:{
        id: true,
        username: true,
        role: true,
        createdAt: true,
      }
    })
    res.status(201).json({success: true, message: "User registered successfully" , data: createUser})
  }catch (err){
    //control err Zoderror
    if (err instanceof ZodError){
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: {
          fieldErrors: err.flatten().fieldErrors
        }
      });
    }
    //control error client
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002'){
      return res.status(409).json({
        success:false,
        error: 'Username already exists'
      })
    }
    // server is error
    console.log(err)
    return res.status(500).json({
      success: false,
      eroor: "Interna"
    })
  }
}
async function login(req:Request , res:Response) {
  try{  
    const {username , password} = loginSchema.parse(req.body)
    const getData = await prisma.user.findUnique({//select username
      where: {username},
    })
    if (!getData){
      return res.status(401).json({success:false ,error: "Invalid username or password"})
    }
    const isMatch = await bcrypt.compare(password, getData.password)
    if (!isMatch){
      return res.status(401).json({success:false ,error: "Invalid username or password"})
    }
    const payload = {id:getData.id, username: getData.username, password: getData.password ,role: getData.role}
    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign(payload,secretKey as string ,{ expiresIn: "1d"})
    res.status(200).json({
      success: true ,
      message: 'Login successful',
      data: {
        id: getData.id,
        username: getData.username,
        role: getData.role,
        createdAt: getData.createdAt
      }, 
      token
    })
  }catch (err){
    if (err  instanceof ZodError){
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: {
          fieldErrors: {
            fieldErrors: err.flatten().fieldErrors
          }
        }
      })
    }
    console.log(err)
  }
}
async function getMe(req:Request , res:Response) {
  try{
    const userId = (req as any).user.id
    const user = await prisma.user.findUnique({
      where: {id: userId},
      select:{
        id: true,
        username:true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
    res.status(200).json({success: true , data: user})
  }catch (err){
    console.log(err)
    res.status(500).json({message: 'server is error'})
  }
}

export const authRerister = {register,login,getMe}

