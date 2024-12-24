import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { database } from "../config/db.js";
import verifyToken from "../middleware/verifyToken.js";
import { ObjectId } from "mongodb";
const secureRoute = express.Router();

secureRoute.use(verifyToken);

const assignmetCollection = database.collection("assignments");
const submissionCollection = database.collection("submission");

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

// delete assignment
secureRoute.post("/delete/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await assignmetCollection.deleteOne(query);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

// get a single assignment
secureRoute.post("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const assignment = await assignmetCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!assignment) {
      return res.status(404).send({
        success: false,
        message: "Assignment not found!",
      });
    }

    res.send(assignment);
  } catch (error) {
    next(error);
  }
});

// Submited assignment by users

secureRoute.post("/submit-assignment", (req, res) => {
  res.json(req.body);

  // try {
  //   const assignment = req.body;
  //   console.log(assignment);
  //   // const result = await submissionCollection.insertOne({
  //   //   ...assignment,
  //   //   date: new Date(assignment.date),
  //   // });
  //   // res.status(200).send({
  //   //   success: true,
  //   //   message: "Assignment submited successfully",
  //   //   result,
  //   // });
  // } catch (error) {
  //   next(error);
  // }
});

export default secureRoute;
