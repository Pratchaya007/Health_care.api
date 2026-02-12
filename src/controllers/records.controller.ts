import type { Request ,Response} from "express";
import z, { json, string, success } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from "../db/prisma.js";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import 'dotenv/config'

const controlRecord = z.object({
  type: z.string().min(2, {error: 'Required'}),
  value: z.any().optional(),
  unit: z.string().optional(),
  note: z.string().optional()
})
const putcontrolrecord = z.object({
  type: z.string({error : 'Required'}).trim(),
  value: z.any().optional(),
  unit: string().optional(),
  note: z.string().optional()
})

async function createRecords(req : Request , res : Response) {
  try{
    const user = (req as any).user as {id:number; role: 'doctor' | 'patient'}
    if (!user){
      return res.status(400).json({success: false , error: 'Authentication required'})
    }

    const {type , value , unit ,note} = controlRecord.parse(req.body)

    if (user.role !== 'patient'){
      return res.status(400).json({success: false , error: 'No access rights'})
    }
    const addDatarecords = await prisma.healthRecord.create({
      data:{
        patientId: user.id,
        type: type,
        value: value,
        unit: unit ?? null,
        note: note ?? null
      }
    })
    console.log(addDatarecords)
    res.status(200).json({
      success: true,
      message: 'Health record created successfully',
      data: addDatarecords
    })
  }catch (err){
    if (err instanceof ZodError){
      return res.status(400).json({
        success : false,
        error: 'Validation failed',
        details: {
          fieldErrors:{
            data : err.flatten().fieldErrors
          }
        }
      })
    }
    console.log(err)
    res.status(500).json({message: ' server is error'})
  }
}
async function getRecords(req : Request , res : Response) {
  try{
    const user = (req as any).user as {id: number ; role : 'doctor' | 'patient'}

    const { type, limit = "10", offset = "0" } = req.query;

    const take = Number(limit);
    const skip = Number(offset)

    const whereData: any = {//✅ 2️⃣ Query เฉพาะของผู้ใช้
      patientId: user.id
    }
    if (type){//✅ รองรับ query parameters (type, limit, offset)
      whereData.type = type
    }
    const total = await prisma.healthRecord.count({//นับผลรวม
      where: whereData
    })
    const records = await prisma.healthRecord.findMany({
      where: whereData,//ดึงเฉพาะ record ที่เป็นของ user คนนี้เท่านั้น
      take,
      skip,
      orderBy:{
        createdAt: 'desc'
      }
    })
    const hasMore = skip + take < total
    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        limit: take,
        offset: skip,
        hasMore,
      },
    })
  }catch (err){
    console.log(err)
    res.status(500).json({
      success: false,
      error: 'Server is Error'
    })
  }
}
async function getRecordsId(req : Request , res : Response) {
  try{
    const user = (req as any).user as {id: number ; role : 'doctor' | 'patient'}
    if(!user){
      return res.status(401).json({success: false, eroor: 'Authentication required'})
    }
    const id = Number(req.params.id)
    const getDataids = await prisma.healthRecord.findUnique({
      where: {id}
    })
    if (!getDataids){
      return res.status(404).json({success: false , error: 'Health record not found'})
    }
    if (getDataids.patientId !== user.id){ //ตรวจสอบเงื่อนไขในการ login
      return res.status(403).json({success: false, error : 'Access denied'})
    }
    res.status(200).json({
      success: true ,
      data: getDataids
    })
  }catch (err){
    console.log(err)
    res.status(500).json({success: false , error: 'server is error'})
  }
}
async function updateRecords(req : Request , res : Response) {
  try{
    const user = (req as any).user as {id: number ; role: 'doctor' | 'patient'}
    if (!user){
      return res.status(401).json({success: false , error: 'Authentication required'})
    }
    const id = Number(req.params.id)

    // ✅ กัน id ไม่ใช่ตัวเลข
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid id",
      });
    }

    const {type , value , unit , note} = putcontrolrecord.parse(req.body)

    const fileData = await prisma.healthRecord.findUnique({
      where : {id}
    })

    if (!fileData) {
      return res.status(404).json({success : false , error: 'Health record not found'})
    }
    if (fileData.patientId !== user.id){
      return res.status(403).json({success: false , error: 'Access denied'})
    }
    const updateRecord = await prisma.healthRecord.update({
      where: {id},
      data: {
        type: type,
        value: value,
        unit: unit ?? null,
        note: note ?? null
      }
    })
    res.status(200).json({
      success: true,
      message: 'Health record updated successfully',
      data: updateRecord
    })
  }catch (err){
    if (err instanceof ZodError){
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: {
          fieldErrors: {
            type: err.flatten().fieldErrors
          }
        }
      })
    }
    console.log(err)
    res.status(500).json('server is error')
  }
}
async function deleteRecords(req : Request , res : Response) {
  try{
    const user = (req as any).user as {id: number ; role: 'doctor' | 'patient'}
    if (!user){
      return res.status(401).json({success: false , error: 'Authentication required'})
    }
    const id = Number(req.params.id)
    const getdatadelete = await prisma.healthRecord.findUnique({
      where: {id}
    })
    if (!getdatadelete){
      return res.status(404).json({success: false , error: 'Heakth record not found'})
    }
    if(getdatadelete.patientId !== user.id){
      return res.status(403).json({success: false , error : 'Access denied'})
    }
    await prisma.healthRecord.delete({
      where: {id}
    })
    res.status(200).json({success: true , message: 'Health record deleted successfully'})
  }catch (err){
    console.log(err)
    res.status(500).json({success: false , error: 'Server is Error'})
  }
}

export const healthrecords = {createRecords,getRecords,getRecordsId,updateRecords,deleteRecords}