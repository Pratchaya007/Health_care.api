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
  note: z.string({error: 'Required'}).trim().min(1)
})


async function createDocter(req: Request , res: Response) {
  try {
    const user = (req as any).user;

    if (user.role !== 'doctor'){//403 Forbidden - ไม่ใช่แพทย์
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
    if(!patient){//404 Not Found - ไม่พบผู้ป่วย
      return res.status(404).json({success: false , error: 'Patient not found'})
    }
    const creatDoc = await prisma.doctorNote.create({
      data:{
        doctorId: user.id,
        patientId,
        note,
      }
    })
    res.status(201).json({//Success Response (201 Created)
      success: true,
      message: "Doctor note created successfully",
      data: creatDoc
    })
  }catch (err){
    if (err instanceof ZodError){//400 Bad Request - ข้อมูลไม่ถูกต้อง
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
    const user = (req as any).user as {id: number; role: "doctor"| 'patient'}
    const {limit = "10" , offset = "0"} = req.query

    const take = Number(limit);
    const skip = Number(offset);

    const whereData = user.role === 'doctor' ? { doctorId: user.id} : {patientId: user.id} //filter role

    const total = await prisma.doctorNote.count({
      where: whereData,
    })
    //getData
    const notes = await prisma.doctorNote.findMany({
      where: whereData,
      take,
      skip,
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.status(200).json({//Success Response (200 OK)
      success: true,
      data: notes,
      pagination : {
        total,
        limit,
        offset,
        hasMore: true
      }
    })
  }catch (err){
    console.log(err)
    res.status(500).json({message: "Server is Error"})
  }
}
async function getDocterID(req: Request , res: Response) {
  try {
    const user = (req as any).user as {id: number; role: "doctor"| 'patient'}
    //401 Unauthorized - ไม่มี token
    if (!user) {
      return res.status(401).json({success: false , error: "Authentication required"})
    }
    const id = Number(req.params.id)
    const note = await prisma.doctorNote.findUnique({
      where: {id}
    })
    if(!note) {
      return res.status(404).json({success : false , error: 'Doctor note not found'})
    }
    if(user.role === 'doctor' && note.doctorId !== user.id){//Access control doctor
      return res.status(403).json({
        success: false,
        error: "Access denied"
      })
    }
    if(user.role === 'patient' && note.patientId !== user.id){//Access control patient
      return res.status(403).json({
        success: false,
        error: "Access denied"
      })
    }
    res.status(200).json({
      success: true,
      data: note
    })
  }catch (err){
    console.log(err)
    res.status(500).json({message: "Server is Error"})
  }
}

const notesDoctors =  z.object({
  note: z.string({error: 'Required'}).trim()
})

async function updateDocterID(req: Request , res: Response) {
  try {
    const user = (req as any).user as {id : number; role : 'doctor' | 'patient'}
    if (!user){
      return res.status(401).json({success: false , error: 'Authentication required'})
    }
    const id = Number(req.params.id)
    const getdata = await prisma.doctorNote.findUnique({
      where: {id}
    })
    const { note } = notesDoctors.parse(req.body)

    if (!getdata){
      return res.status(404).json({success: false , error: "Doctor note not found"})
    }
    if (user.role !== 'doctor' ){
      return res.status(403).json({
        success: false , error: 'Only the note s author can edit it'
      })
    }
    if (getdata.doctorId !== user.id){
      return res.status(403).json({success: false , error: 'Only the note s author can edit it'})
    }
    const updateData = await prisma.doctorNote.update({
      where: {id},
      data: {note}
    })

    res.status(200).json({
      success: true,
      message: 'Doctor note updated successfully',
      data : updateData
    })
  }catch (err){
    if(err instanceof ZodError){
      return res.status(400).json({
        success:false,
        error: 'Validation failed',
        details: {
          fieldErrors: err.flatten().fieldErrors
        }
      })
    }
    console.log(err)
    res.status(500).json({message: 'Server is Error'})
  }
}
async function deleteDocterID(req: Request , res: Response) {
  try {
    //401 Unauthorized - ไม่มี token
    const user = (req as any).user as {id: number ; role: 'doctor' | 'patient'}
    if (!user){
      return  res.status(401).json({success: false, error: 'Authentication required'})
    }
    const id = Number(req.params.id)

    if (isNaN(id)){
      return res.status(400).json({success: false , error: 'Invalid ID'})
    }

    const getdeleteData = await prisma.doctorNote.findUnique({
      where: {id}
    })
    if (!getdeleteData) {//404 Not Found - ไม่พบบันทึก
      return res.status(404).json({success: false , error: 'Doctor note not found'})
    }
    if(user.role !== 'doctor' || getdeleteData.doctorId !== user.id){
      return res.status(403).json({success: false, error: 'Only the note s author can delete it'})
    }

    await prisma.doctorNote.delete({
      where: {id}
    })

    res.status(200).json({success: true , message: 'Doctor note deleted successfully'})
  }catch (err){
    console.log(err)
    res.status(500).json({message: 'Server is Error'})
  }
}

export const docternotesData = {createDocter,getDocter,getDocterID,updateDocterID,deleteDocterID}
  