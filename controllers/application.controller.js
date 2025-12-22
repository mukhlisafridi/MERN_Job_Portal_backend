import { errorHandler } from "../middleware/error.js";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";

export const applyJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;
    if (!jobId) {
      return next(errorHandler(400, "Job id is required"));
    }
    // check if the user has already applied for the job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return next(errorHandler(400, "You have already applied for this jobs"));
    }
    // check if the jobs exists
    const job = await Job.findById(jobId);
    if (!job) {
      return next(errorHandler(404, "Job Not Availible..!"));
    }
    // create a new application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();
    return res.status(201).json({
      message: "Job applied successfully.",
      success: true,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

//for students
export const getAppliedJobs = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: "company",
        options: { sort: { createdAt: -1 } },
      });

    if (!application) {
      return next(errorHandler(404,"Applications Not Found..!"))
    }
    return res.status(200).json({
      application,
      success: true,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
//for admin
export const getApplicants = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
      }
    });
    if (!job) {
      return next(errorHandler(404,"Job not found..!"))
    }
    return res.status(200).json({
      job,
      succees: true,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};

export const updateStatus = async (req, res,next) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return next(errorHandler(400,"status is required..!"))
    }
   // find the application by applicantion id
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return next(errorHandler(404,"Application not found..!"))
    }

    // update the status
    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: "Status updated successfully.",
      success: true,
    });
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
