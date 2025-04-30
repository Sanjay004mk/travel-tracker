import dotenv from "dotenv";
import fs from "fs";

const envPath = `.env.${process.env.NODE_ENV}`;

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

if (!process.env.JWT_SECRET) {
    console.error("JWT SECRET not set");
    process.exit(-1);
}

import db from "./database/connection.js";
db();
import app from "./app.js";

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`); 
});