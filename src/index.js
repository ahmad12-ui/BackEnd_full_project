import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});
connectDB();
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
