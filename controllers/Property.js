const Property = require("../models/Property");
const asyncHandler = require("express-async-handler");
const { APIError } = require("../Errors/APIError");
const { ApiFeatures } = require("../middlewares/apiFeatures");
const { uploadMultipleImages } = require("../middlewares/uploadImages");
const sharp = require("sharp");

const uploadPropertyImages = uploadMultipleImages([
  {
    name: "property_image",
    maxCount: 1,
  },
  {
    name: "property_images",
    maxCount: 9,
  },
]);
const resizePropertyImages = asyncHandler(async (req, res, next) => {
  if (req.files.property_image) {
    const fileNameForCoverImage = `property-${req.body.estateArea.replace(
      " ",
      "-"
    )}-${req.body.propertyNumber}-${Date.now()}.jpeg`;
    await sharp(req.files.property_image[0].buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/property/${fileNameForCoverImage}`);
    req.body.property_image = fileNameForCoverImage;
  }
  if (req.files.property_images) {
    req.body.property_images = [];
    await Promise.all(
      req.files.property_images.map(async (img, index) => {
        const imageName = `property-${req.body.estateArea.replace(" ", "-")}-${
          req.body.propertyNumber
        }-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(600, 600)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/property/${imageName}`);

        // Save image into our db
        req.body.property_images.push(imageName);
      })
    );
  }
  next();
});

const addProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.create({
    user_id: req.user._id,
    typeOfProperty: req.body.type,
    location: req.body.location,
    area: req.body.area,
    room_number: req.body.roomNumber,
    height: req.body.height,
    details: req.body.details,
    price: req.body.price,
    isItForRental: req.body.isItRental,
    realEstateArea: req.body.estateArea,
    propertyNumber: req.body.propertyNumber,
    property_image: req.body.property_image,
    property_images: req.body.property_images,
    agency: req.body.agency,
  });
  if (!property) {
    throw new APIError("we couldn't add your property try again", 500);
  }
  res.status(201).json({
    status: "success",
    property: property,
  });
});

const getAProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findOne({ _id: req.params.id });
  if (!property) {
    throw new APIError("there is no property with id " + req.params.id, 404);
  }
  res.status(200).json({ prop: property });
});
const getAllProperties = asyncHandler(async (req, res, next) => {
  const documentCounts = await Property.countDocuments({ isAccepted: true });
  const apiFeatures = new ApiFeatures(
    Property.find({ isAccepted: true }),
    req.query
    ).search("Property") 
    .pagination(documentCounts)
    .sort()
    .limitFields()
    ;
  const { MongooseQuery, PaginationResult } = apiFeatures;
  const properties = await MongooseQuery;
  if (!properties) {
    throw new APIError("there is no properties yet", 404);
  }
  res.status(200).json({
    result: properties.length,
    prop: properties,
    pagination: PaginationResult,
  });
});
const updateProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  );
  if (!property) {
    throw new APIError("there is no property with id " + req.params.id, 404);
  }
  res.status(200).json({ prop: property });
});
const deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findOneAndDelete({ _id: req.params.id });
  if (!property) {
    throw new APIError("there is no property with id " + req.params.id, 404);
  }
  res.status(200).json({ message: "success" });
});
// const resolveToURI = (object) =>
//   asyncHandler(async (req, res, next) => {
//     let temporaryArray = [];
//     for (let prop in object) {
//       if (object.hasOwnProperty(prop)) {
//         temporaryArray.push(
//           encodeURIComponent(prop) + "=" + encodeURIComponent(object[prop])
//         );
//       }
//     }
//     let queryString = temporaryArray.join("&");
//     req.query = queryString.replace(/&/g, " ");
//     next();
//   });
const updatePropertyStatus = asyncHandler(async (req, res, next) => {
  const property = await Property.findOneAndUpdate(
    { _id: req.body.propertyId },
    { $set: { isAccepted: true } },
    { new: true }
  );
  if (!property) {
    throw new APIError("there is no property with id " + req.body.propertyId);
  }
  res.status(200).json({ status: "success" });
});
module.exports = {
  resizePropertyImages,
  uploadPropertyImages,
  addProperty,
  getAProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
};
