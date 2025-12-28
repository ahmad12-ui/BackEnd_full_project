import express from "express";
import cookieParser from "cookie-parser"; // read about it from documents
import cors from "cors"; // read also about it and check what is middle ware we mainly have use keyword for middle or config

const app = express();
//cors is always use when the app is created

app.use(
  cors({
    origin: process.env.ORIGIN_CORS,
    credentials: true,
  })
); // cors is method which provide middle ware and also take a object

app.use(express.json({ limit: "16kb" })); // this is config when user snd data in json format
app.use(
  express.urlencoded({
    limit: "16kb",
    extended: true, // allow object in object
  })
); // this is use when user snd data is in url it tell server to understand data comming in url

app.use(express.static("public")); // this store file like pdf on our server in public folder

app.use(cookieParser()); // cookie is small piece of data that store on browser and cookie parser read it and parse into json format

//router import
import userRouter from "./routes/users.routes.js";
import videoRouter from "./routes/videos.routes.js";
app.use("/api/v1/users", userRouter);

// video router
app.use("/api/v1/videos", videoRouter);

export default app;
