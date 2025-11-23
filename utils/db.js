import mongoose from "mongoose";
export const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log(`CONNECTED TO DB SUCCESSFULLY`);
        
    } catch (error) {
        console.log(`ERROR IN CONNECTED DB ${error}`);
        
    }
}

