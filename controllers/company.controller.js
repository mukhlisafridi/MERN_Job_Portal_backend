import { errorHandler } from "../middleware/error.js";
import Company from "../models/company.model.js";
export const registerCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return next(errorHandler(400, "Company Name Is Required..!"));
    }
    let company = await Company.findOne({ name: companyName });
    if (company) {
      return next(
        errorHandler(400, "Company Already Registered With This Name..!")
      );
    }
    company = await Company.create({
      name: companyName,
      userId: req.id,
    });
    return res.status(201).json({
      message: "Company Registered Successfully..!",
      success: true,
      company,
    });
  } catch (error) {
    console.log(error.message);
    return next(errorHandler(500, error.message));
  }
};
export const getCompany = async (req, res, next) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId });
    if (!companies) {
      return next(errorHandler(404, "Company Not Found..!"));
    }
    return res.status(200).json({
      message: "All Companies",
      success: true,
      companies,
    });
  } catch (error) {
    console.log(error.message);

    return next(errorHandler(500, error.message));
  }
};
export const getCompanyById = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return next(errorHandler(404, "Company Not Found"));
    }
    return res.status(200).json({
      message: " Company",
      success: true,
      company,
    });
  } catch (error) {
    console.log(error.message);
    next(errorHandler(500, error.message));
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;
    const updateData = { name, description, website, location };
    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!company) {
      return next(errorHandler(404, "Company Not Found..!"));
    }
    return res.status(200).json({
      message: "Company Data Updated..!",
      success: true,
      company,
    });
  } catch (error) {
    console.log(error.message);
    next(errorHandler(500, error.message));
  }
};
