const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

require("./config/passport");
require("dotenv").config();



const app = express();
app.use(express.json());


app.use(
  cors({
    origin: ["http://localhost:3000", "https://docufy-ai.vercel.app"],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"], 
    credentials: true, 
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "random_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

app.use(passport.initialize());

app.options("*", cors());


mongoose
  .connect(process.env.MONGO_URI) 
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/github", authRoutes);
app.use("/api/user", userRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
