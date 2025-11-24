import User from "../models/user.model.js";
import { errorHandler } from "../middleware/error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;
    if (!fullName || !email || !phoneNumber || !password || !role) {
      return next(errorHandler(400, "Some Thing is missing..!"));
    }
    const isExist = await User.findOne({ email });
    if (isExist) {
      return next(errorHandler(400, "User Already Registered..!"));
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashPassword,
      role,
    });
    user.password = undefined;
    return res.status(201).json({
      message: "User Registered Successfully..!",
      success: true,
      user,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return next(errorHandler(400, "Some Thing is missing..!"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(400, "Invalid Credentials..!"));
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return next(errorHandler(400, "Invalid Credentials..!"));
    }
    if (role !== user.role) {
      return next(errorHandler(400, "User Is Not Valid For This Role..!"));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    user.password = undefined;
    return res
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "none",
      })
      .status(200)
      .json({
        message: "User Loggined Successfully..!",
        success: true,
        user,
      });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

export const logout = async (req, res, next) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).status(200).json({
      message: "User Logout Successfully..!",
      success: true,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
    console.log(error.message);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;
    let skillsArray;
    if (skills) {
      skillsArray = skills.split(",");
    }
    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skillsArray;

    await user.save();

    user.password = undefined;

    return res.status(200).json({
      message: "Profile Updated Successfully..!",
      success: true,
      user,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
    console.log(error.message);
  }
};
