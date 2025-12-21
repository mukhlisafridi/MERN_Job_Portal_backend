import express from "express";
import {
 getMyJobs,
  getAllJobs,
  getJobById,
  postJob,
} from "../controllers/job.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();
router.route("/create").post(isAuthenticated, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/my").get(isAuthenticated, getMyJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

export default router;
