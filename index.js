import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB, database } from "./config/db.js";
import usersRoute from "./routes/usersRoute.js";
import secureRoute from "./routes/secureRoute.js";

dotenv.config();
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// connectDB();

// define usersRoute
app.use("/users", usersRoute);
app.use("/assignment", secureRoute);

app.get("/", (req, res) => {
  res.send("hello");
});

// handle no route found
app.use((req, res, next) => {
  res.status(404).send({
    message: "No route found!",
  });
});

// global error handling

app.use((err, req, res, next) => {
  console.log(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error!";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost/${port}`);
});
