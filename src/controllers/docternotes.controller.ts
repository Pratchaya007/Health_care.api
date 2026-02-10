import type { Request ,Response} from "express";
import z, { success } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from "../db/prisma.js";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import 'dotenv/config'


const controlRequest = z.object({
  patientId: z.number({error: 'Expected number, received string'}),
  note: z.string().trim().min(1 ,{error: 'Required'})
})


async function createDocter(req: Request , res: Response) {
  try {
    const user = (req as any).user;

    if (user.role !== 'doctor'){
      return res.status(403).json({
        success: false,
        error: 'Only doctors can create notes'
      })
    }
    const {patientId , note} = controlRequest.parse(req.body)
    const patient = await prisma.user.findFirst({
      where:{
        id: patientId,
        role: 'patient'
      }
    })
    if(!patient){
      return res.status(404).json({success: false , error: 'Patient not found'})
    }
    const creatDoc = await prisma.doctorNote.create({
      data:{
        doctorId: user.id,
        patientId,
        note,
      }
    })
    res.status(201).json({
      success: true,
      message: "Doctor note created successfully",
      data: creatDoc
    })
  }catch (err){
    if (err instanceof ZodError){
      return res.status(400).json({
        success: false,
        error : 'Validation failed',
        details: {
          fieldErrors: err.flatten().fieldErrors
        }
      })
    }
    console.log(err)
  }
}
async function getDocter(req: Request , res: Response) {
  try {

  }catch (err){

  }
}
async function getDocterID(req: Request , res: Response) {
  try {

  }catch (err){

  }
}
async function updateDocterID(req: Request , res: Response) {
  try {

  }catch (err){

  }
}
async function deleteDocterID(req: Request , res: Response) {
  try {

  }catch (err){

  }
}

export const docternotesData = {createDocter,getDocter,getDocterID,updateDocterID,deleteDocterID}
  