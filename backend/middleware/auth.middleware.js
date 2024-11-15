import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({ msg: "Unauthorized - No token found" });
    }
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_SECRET_ACCESS_TOKEN
      );
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ msg: "Unauthorized - User not found" });
      }
      req.user = user;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Unauthorized - Token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log(`error in protect route ${error}`);
    res.status(500).json({ msg: error.message });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({ msg: "Unauthorized - Not an admin" });
  }
};
