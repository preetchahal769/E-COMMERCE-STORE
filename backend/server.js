//  Libary Imports
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Routes Imports
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponsRoutes from "./routes/coupons.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

// Database Connection
import connectToDB from "./lib/db.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// auth routes

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cart", cartRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
  connectToDB();
});
