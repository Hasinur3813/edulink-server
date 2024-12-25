import express from "express";
import { database } from "../config/db.js";
import verifyToken from "../middleware/verifyToken.js";
import { ObjectId } from "mongodb";
const secureRoute = express.Router();

const assignmetCollection = database.collection("assignments");
const submissionCollection = database.collection("submission");

secureRoute.use(verifyToken);

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

// get all the pending assignment

secureRoute.get("/pending-assignment", async (req, res, next) => {
  try {
    const cursor = submissionCollection.find({ status: "Pending" });
    const assignments = await cursor.toArray();
    res.send(assignments);
  } catch (error) {
    next(error);
  }
});

// create assignment
secureRoute.post("/create", async (req, res, next) => {
  try {
    const data = req.body;
    const assignment = {
      ...data,
      dueDate: new Date(data.dueDate),
    };
    const result = await assignmetCollection.insertOne(assignment);
    res.status(200).json({
      success: true,
      message: "Successfully created assignment",
      result,
    });
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
// Submited assignment by users

secureRoute.post("/submit-assignment", async (req, res, next) => {
  try {
    const assignment = req.body;
    const result = await submissionCollection.insertOne({
      ...assignment,
      date: new Date(assignment.date),
    });
    res.status(200).send({
      success: true,
      message: "Assignment submited successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
});

// update pending assignment

secureRoute.patch("/update-pending-assignment/:id", async (req, res, next) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const assignment = { ...data, date: new Date(data.date) };

    const query = { _id: new ObjectId(id) };

    const result = await submissionCollection.replaceOne(query, assignment, {
      upsert: true,
    });
    res.send(result);
  } catch (error) {
    next(error);
  }
});

// get submited assignment by specific user

secureRoute.get("/my-assignment/:email", async (req, res, next) => {
  const email = req.params?.email;
  console.log(email);
  const query = { userEmail: email };
  try {
    const cursor = submissionCollection.find(query);
    const assignments = await cursor.toArray();
    res.send(assignments);
  } catch (error) {
    next(error);
  }
});

// get assignment by filter
secureRoute.get("/filter", async (req, res, next) => {
  const difficultyLevel = req.query;
  try {
    if (difficultyLevel?.difficulty === "all") {
      const cursor = assignmetCollection.find();
      const assignments = await cursor.toArray();
      return res.send(assignments);
    }

    const query = { difficulty: difficultyLevel.difficulty };

    const cursor = assignmetCollection.find(query);
    const assignments = await cursor.toArray();
    res.send(assignments);
  } catch (error) {
    next(error);
  }
});

// get assignment by user search

secureRoute.get("/search", async (req, res, next) => {
  const { search } = req.query;
  if (!search) {
    return res.status(404).send({
      success: false,
      message: "Search term is required!",
    });
  }
  try {
    const query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    const cursor = assignmetCollection.find(query);
    const assignment = await cursor.toArray();
    res.send(assignment);
  } catch (error) {
    next(error);
  }
});

// get a single assignment
secureRoute.post("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const assignment = await assignmetCollection.findOne(query);
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

export default secureRoute;
