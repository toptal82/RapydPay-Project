require("dotenv").config();
const mongoose = require("mongoose");
const ATLAS_DB_URL = 'mongodb+srv://ace906245:admin1234@cluster0.wvo19nr.mongodb.net/?retryWrites=true&w=majority';
const LOCAL_DB_URL = 'mongodb://127.0.0.1:27017/test';
const URL = LOCAL_DB_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.error("MongoDB connection FAIL");
    process.exit(1);
  }
};

module.exports = connectDB;