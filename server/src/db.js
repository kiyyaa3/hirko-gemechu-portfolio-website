import mongoose from "mongoose";

let databaseReady = false;
let databaseError = null;

export async function connectDb() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS || 10000)
  });
  databaseReady = true;
  databaseError = null;
  console.log("MongoDB connected");
}

mongoose.connection.on("disconnected", () => {
  databaseReady = false;
});

mongoose.connection.on("error", (error) => {
  databaseReady = false;
  databaseError = error;
});

export function isDatabaseReady() {
  return databaseReady;
}

export function getDatabaseStatus() {
  return {
    ready: databaseReady,
    state: mongoose.connection.readyState,
    error: databaseError?.message || null
  };
}
