const express = require("express");
const app = express();
const morgan = require("morgan");
const db = require("./db/index");
const cors = require("cors");
const routes = require("./routes/index");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

app.use("/api", routes);

db.sync({ force: false })
  .then(() => {
    app.listen(5000, () => {
      console.log("Server levantado en el puero 5000");
    });
  })
  .catch(console.error);
