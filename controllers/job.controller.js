import Job  from "../models/job.model.js";
import Company from "../models/company.model.js";
import { errorHandler } from "../middleware/error.js";

export const postJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    const userId = req.user._id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return next(errorHandler(400, "Something is missing"));
    }
    const company = await Company.findOne({
      _id: companyId,
      userId: userId,
    });

    if (!company) {
      return next(
        errorHandler(403, "You are not allowed to post job for this company")
      );
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req.length > 0),
      salary: Number(salary),
      location,
      jobType,
      experience,
      position,
      company: companyId,
      created_by: userId,
    });

    return res.status(201).json({
      success: true,
      message: "New job created successfully",
      job,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
// jobs search for students
export const getAllJobs = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    if (!jobs) {
      return next(errorHandler(404, "Job Not Found..!"));
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
// student
export const getJobById = async (req, res,next) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path:"applications"
    });
    if (!job) {
      return next(errorHandler(404, "Job Not Found..!"));
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
// admin
export const getMyJobs = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      createdAt: -1,
    });
    if (!jobs) {
      return next(errorHandler(404, "Job Not Found..!"));
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
