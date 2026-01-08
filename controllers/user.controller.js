import User from "../models/user.model.js";
import { errorHandler } from "../middleware/error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !role) {
      return next(errorHandler(400, "Something is missing"));
    }

    const isExist = await User.findOne({ email });
    if (isExist) {
      return next(errorHandler(400, "User already registered"));
    }

    let profilePhoto = "";
    const file = req.file;

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = cloudResponse.secure_url;
    }

    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.HASH_SALT)
    );

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashPassword,
      role,
      profile: {
        profilePhoto,
      },
    });

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(errorHandler(400, "Email or password is missing..!"));
    }
    let user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(400, "Invalid credentials..!"));
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(errorHandler(400, "Invalid credentials..!"));
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    user.password = undefined;
    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profile: user.profile,
      phoneNumber: user.phoneNumber,
    };
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: Number(process.env.COOKIE_EXPIRES_IN),
      })
      .status(200)
      .json({
        message: `Welcome ${user.fullName}`,
        success: true,
        user,
      });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

export const logout = async (req, res, next) => {
  try {
    return res
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(200)
      .json({
        success: true,
        message: "User logged out successfully!",
      });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;

    // Cloudinary upload with proper configuration
    const file = req.file;
    let cloudResponse;

    if (file) {
      const fileUri = getDataUri(file);
      cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    }

    const user = req.user;
    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return next(errorHandler(400, "Email already in use"));
      }
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) {
      user.profile.skills = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);
    }
    console.log(cloudResponse);
    //  Save resume only if upload successful
    if (file && cloudResponse) {
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = file.originalname;
    }
    console.log(file);

    await user.save();
    user.password = undefined;
    console.log(user.profile);

    const responseUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile Updated Successfully..!",
      success: true,
      user: responseUser,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
    console.log(error.message);
  }
};
