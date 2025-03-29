import dotenv from "dotenv";
dotenv.config({path: `.env.${process.env.NODE_ENV}`});

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