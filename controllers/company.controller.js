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
      userId: req.user._id,
    });
    // to save company ID in user model
    // req.user.profile.company = company._id;
    // await req.user.save();
    return res.status(201).json({
      message: `Welcome ${req.user.fullName} to ${company.name}`,
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
    const userId = req.user._id;
    const companies = await Company.find({ userId });
    if (!companies || companies.length === 0) {
      return next(errorHandler(404, "Company Not Found..!"))
    }
    return res.status(200).json({
      message: "All Companies",
      success: true,
      companies,
    })
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
      message: "Company",
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
    const companyId = req.params.id;
    const userId = req.user._id;

    const company = await Company.findById(companyId);
    if (!company) {
      return next(errorHandler(404, "Company Not Found..!"));
    }

    if (company.userId.toString() !== userId.toString()) {
      return next(errorHandler(403, "You are not allowed to update this company"));
    }

    if (name) company.name = name;
    if (description) company.description = description;
    if (website) company.website = website;
    if (location) company.location = location;

    await company.save();

    return res.status(200).json({
      message: "Company updated successfully!",
      success: true,
      company,
    });
  } catch (error) {
    console.log(error.message);
    next(errorHandler(500, error.message));
  }
};
