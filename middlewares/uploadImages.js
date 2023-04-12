const multer = require("multer");
const { APIError } = require("../Errors/APIError");

const MulterOptions = () => {
  const MemoryStorage = multer.memoryStorage();

  const multerFilters = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new APIError("Only images are allowed", false));
    }
  };
  const upload = multer({ storage: MemoryStorage, fileFilter: multerFilters });
  return upload;
};
const uploadSingleImage = (fieldName) => MulterOptions().single(fieldName);
const uploadMultipleImages = (arrayOfFields) =>
  MulterOptions().fields(arrayOfFields);

module.exports = { uploadSingleImage, uploadMultipleImages };
