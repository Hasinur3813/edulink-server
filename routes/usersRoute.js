import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { database } from "../config/db.js";
const usersRoute = express.Router();

const usersCollection = database.collection("users");

// user registration
usersRoute.post("/signup", async (req, res, next) => {
  try {
    const user = req.body;
    const isExistAlready = await usersCollection.findOne({ email: user.email });
    if (isExistAlready) {
      return res.status(403).send({
        success: false,
        message: "User is already registered",
      });
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await usersCollection.insertOne({
      ...user,
      password: hashedPassword,
    });
    res.json({
      success: true,
      message: "Successfully registered!",
      result,
    });
  } catch (err) {
    next(err);
  }
});

// check if a user is available for google log in

usersRoute.post("/google-login", async (req, res, next) => {
  try {
    const user = req.body;
    const isExistUser = await usersCollection.findOne({ email: user.email });
    if (isExistUser) {
      return res.status(200).send({
        success: true,
        message: "Registered user",
      });
    }

    const result = await usersCollection.insertOne(user);
    if (result.insertedId) {
      res.send({
        success: true,
        message: "Successfully registered",
        result,
      });
    } else {
      res.status(403).send({
        success: false,
        message: "Unauthorized user",
      });
    }
  } catch (error) {
    next(error);
  }
});
// user logout
usersRoute.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 0,
    });
    res.status(200).json({
      success: true,
      message: "Successfully logged out",
    });
  } catch (error) {
    next(error);
  }
});

// generate token
usersRoute.post("/generate-token", async (req, res, next) => {
  try {
    const user = req.body;

    if (!user)
      return res.status(404).json({ message: "user data is required!" });

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "10h" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({
        success: true,
        message: "token genereted",
      });
  } catch (error) {
    next(error);
  }
});

export default usersRoute;
