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

// user logout
usersRoute.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
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
    const { email } = req.body;

    if (!email) return res.status(404).json({ message: "email is required!" });

    const findUser = await usersCollection.findOne({ email: email });
    if (!findUser) {
      return res.status(401).json({
        success: false,
        message: "user not found!",
      });
    }

    const token = jwt.sign(
      { name: findUser.name, id: findUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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
