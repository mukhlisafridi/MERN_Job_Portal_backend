import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return next(errorHandler(401, "User Not Authorized..!"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(errorHandler(404, "User Not Found.."));
    }
    req.id = user._id;
    next();
  } catch (error) {
    next(errorHandler(500, error.message));
    console.log(error.message);
  }
};
