// ESM syntax is supported.
import express from "express";
import { userRouter, sessionRouter } from "./routes/index";
import mongoose from "mongoose";
import session from "express-session";
import connectStore from "connect-mongo";
import {
  PORT,
  NODE_ENV,
  MONGO_URI,
  SESS_LIFETIME,
  SESS_NAME,
  SESS_SECRET,
} from "../config";

(async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to mongoDB");
    const app = express();
    const MongoStore = connectStore(session);

    app.disable("x-powered-by");

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(
      session({
        name: SESS_NAME,
        secret: SESS_SECRET,
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({
          mongooseConnection: mongoose.connection,
          collection: "session",
          ttl: parseInt(SESS_LIFETIME) / 1000,
        }),
        cookie: {
          sameSite: true,
          secure: NODE_ENV === "production",
          maxAge: parseInt(SESS_LIFETIME),
        },
      })
    );

    const apiRoutes = express.Router();
    app.use("/api", apiRoutes);
    apiRoutes.use("/users", userRouter);
    apiRoutes.use("/session", sessionRouter);

    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
})();
