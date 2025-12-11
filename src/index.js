import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
  path: "./env",
});
connectDB()
  .then(
    app.on("error", (error) => {
      console.log("listening error ::", error);
      throw error;
    }),
    app.listen(process.env.PORT || 3000, () => {
      console.log(`app is running on port : ${process.env.PORT}`);
    })
  )
  .catch((error) => ("db connection failed", error));

/*
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`);
    app.on(
      "error",
      () => {
        console.log("listening error ", error);
        throw error;
      },

      app.listen(process.env.PORT, () => {
        console.log(`App is listening on port  ${process.env.PORT}`);
      })
    );
  } catch (error) {
    console.error("error : ", error);
    throw error;
  }
})();*/
