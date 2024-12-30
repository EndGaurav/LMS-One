import dotenv from "dotenv";
import connectDB from "./database/index.js";
import { app } from "./app.js";


dotenv.config({
    path: "./.env"
})



const PORT = process.env.PORT || 5000;


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening at port ${PORT}`);
        
    })
})
.catch((error) => {
    console.log("Mongodb connection error: ", error);  
})