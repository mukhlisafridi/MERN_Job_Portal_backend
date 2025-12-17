export const jobPost = async (req, res, next) => {
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
    const userId = req.id;

    
  } catch (error) {
    console.log(error.message);
    return next(errorHandler(500,error.message))
  }
};
