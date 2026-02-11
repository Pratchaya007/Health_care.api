import type { Request ,Response} from "express";
import z, { success } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from "../db/prisma.js";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import 'dotenv/config'


async function createRecords(req : Request , res : Response) {
  try{

  }catch (err){
    console.log(err)
  }
}
async function getRecords(req : Request , res : Response) {
  try{

  }catch (err){
    console.log(err)
  }
}
async function getRecordsId(req : Request , res : Response) {
  try{

  }catch (err){
    console.log(err)
  }
}
async function updateRecords(req : Request , res : Response) {
  try{

  }catch (err){
    console.log(err)
  }
}
async function deleteRecords(req : Request , res : Response) {
  try{

  }catch (err){
    console.log(err)
  }
}

export const healthrecords = {createRecords,getRecords,getRecordsId,updateRecords,deleteRecords}