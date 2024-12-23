import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { database } from "../config/db.js";
import verifyToken from "../middleware/verifyToken.js";
const secureRoute = express.Router();

secureRoute.use(verifyToken);

const assignmetCollection = database.collection("assignments");

// create assignment
secureRoute.post("/create", async (req, res, next) => {
  try {
    const data = req.body;
    const assignment = {
      ...data,
      dueDate: new Date(data.dueDate),
    };
    const result = await assignmetCollection.insertOne(assignment);
    console.log(result);
    res.status(200).json({
      success: true,
      message: "Successfully created assignment",
      result,
    });
  } catch (error) {
    next(error);
  }
});

// get all the assignments

secureRoute.get("/", async (req, res, next) => {
  try {
    const cursor = assignmetCollection.find();
    const assignment = await cursor.toArray();
    res.send(assignment);
  } catch (error) {
    next(error);
  }
});

export default secureRoute;
