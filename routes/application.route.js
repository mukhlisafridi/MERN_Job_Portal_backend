import express from "express";
import {
  applyJob,
  getAppliedJobs,
  getApplicants,
  updateStatus,
} from "../controllers/application.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

// Apply on a job
router.route("/apply/:id").post(isAuthenticated, applyJob);

// Get all applied jobs of logged-in student
router.route("/get-applied").get(isAuthenticated, getAppliedJobs);

// Get all applicants for a specific job
router.route("/:id/applicants").get(isAuthenticated, getApplicants);

// Update application status (accept / reject)
router.route("/status/:id/update").put(isAuthenticated, updateStatus);

export default router;
