import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import helmet from "helmet";
import cors from "cors";
import Template from "./../template";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
// only during dev otherwise comment out
import devBundle from "./devBundle";
import path from "path";

const CURRENT_WORKING_DIR = process.cwd();
const app = express();
// only during dev otherwise comment out
devBundle.compile(app);

/*... configure express ... */
app.use("/dist", express.static(path.join(CURRENT_WORKING_DIR, "dist")));

// parse body params and attach them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// authenticated routes
app.use("/", authRoutes);

app.get("/", (req, res) => {
  res.status(200).send(Template());
});

app.use("/", userRoutes);

//handle auth related errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});

export default app;
