import app from "./app.js";

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`); 
});