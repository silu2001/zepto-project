import mongoose from "mongoose";

let retryCount = 0;
const MAX_RETRIES = 5;

// ✅ Register listeners ONCE
mongoose.connection.on("connected", () => {
  console.log("✅ Database connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Database error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Database disconnected");
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: "majority",
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB connected successfully");
    retryCount = 0;
  } catch (error) {
    retryCount++;
    console.error(
      `❌ MongoDB connection failed (Attempt ${retryCount}/${MAX_RETRIES}):`,
      error.message
    );

    if (retryCount < MAX_RETRIES) {
      console.log("🔄 Retrying in 5 seconds...");
      setTimeout(connectDB, 5000);
    } else {
      console.error("❌ Max retries reached. Please check:");
      console.error("1. Internet connection");
      console.error("2. MONGODB_URI in .env");
      console.error("3. MongoDB Atlas IP whitelist / firewall");
      process.exit(1);
    }
  }
};

export default connectDB;
