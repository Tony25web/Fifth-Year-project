class ApiFeatures {
  constructor(MongooseQuery, RequestQuery) {
    this.MongooseQuery = MongooseQuery;
    this.RequestQuery = RequestQuery;
  }
  sort() {
    if (this.RequestQuery.sort) {
      let sortQuery = this.RequestQuery.sort.split(",").join(" ");
      this.MongooseQuery = this.MongooseQuery.sort(sortQuery);
    } else {
      this.MongooseQuery = this.MongooseQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.RequestQuery.fields) {
      let fields = this.RequestQuery.fields.split(",").join(" ");
      this.MongooseQuery = this.MongooseQuery.select(fields);
    } else {
      this.MongooseQuery = this.MongooseQuery.select("-__v");
    }
    return this;
  }

  search(ModelName) {
    console.log("inside search")
    let query = {};
    if (
      checkForSearchParameters(this.RequestQuery) &&
      Object.keys(this.RequestQuery).length !== 0
    ) {
      if (ModelName === "Property") {
        console.log("inside search 1")
        query.$or = [
          {
            ...searchByLocationAndRoomNum(
              this.RequestQuery.roomNumber,
              this.RequestQuery.location
            ),
          },
          {
            area: searchForArea(
              this.RequestQuery.lesserArea,
              this.RequestQuery.greaterArea
            ),
          },
          {
            ...searchForEverything(this.RequestQuery),
          },
          {
            price: searchForPrice(
              this.RequestQuery.lesserPrice,
              this.RequestQuery.greaterPrice
            ),
          },
          { ...searchByStatus(this.RequestQuery.isItForRental) },
          { ...searchByType(this.RequestQuery.type) },
        ];
      } else {
        query.$or = [
          {
            $and: [
              {
                location: {
                  $regex: this.RequestQuery.location,
                  $options: "i",
                },
              },
              { price: { $lte: this.RequestQuery.lesserPrice } },
              { price: { $gte: this.RequestQuery.greaterPrice } },
              { area: { $lte: this.RequestQuery.greaterArea } },
              { area: { $gte: this.RequestQuery.lesserArea } },
            ],
          },
          {
            location: { $regex: this.RequestQuery.location, $options: "i" },
          },
          {
            $and: [
              { price: { $lte: this.RequestQuery.lesserPrice } },
              { price: { $gte: this.RequestQuery.greaterPrice } },
            ],
          },
          {
            $and: [
              { area: { $lte: this.RequestQuery.lesserPrice } },
              { area: { $gte: this.RequestQuery.greaterPrice } },
            ],
          },
        ];
      }
    } else {
      console.log("inside else ");
      query = {};
    }
    console.log(query);
    this.MongooseQuery = this.MongooseQuery.find(query);
    return this;
  }

  pagination(countDocuments) {
    const page = +this.RequestQuery.page || 1;
    const productLimit = +this.RequestQuery.limit || 10;
    const skip = (page - 1) * productLimit;
    const endIndex = page * productLimit;
    /* the index of the last product in a page ex 
    (page * limit <countDocuments)=> ((1*5=5) < 25 )=>acceptable (for the next property to be added)*/
    let pagination = {};
    pagination.currentPage = page;
    pagination.limit = productLimit;
    pagination.numbOfPages = Math.ceil(countDocuments / productLimit);
    if (endIndex < countDocuments) {
      pagination.next = page + 1;
    }
    if (skip > 0) {
      pagination.previous = page - 1;
    }
    this.PaginationResult = pagination;
    this.MongooseQuery = this.MongooseQuery.skip(skip).limit(productLimit);
    return this;
  }
}

function searchForPrice(lessPrice = undefined, greatPrice = undefined) {
  if (lessPrice !== undefined && greatPrice !== undefined) {
    return {
      $gte: lessPrice,
      $lt: greatPrice,
    };
  } else if (greatPrice !== undefined) {
    return {
      $lte: greatPrice,
    };
  } else if (lessPrice !== undefined) {
    return {
      $gte: lessPrice,
    };
  } else {
    return;
  }
}
function searchForEverything(queryObject) {
  const {
    roomNumber,
    lesserPrice,
    greaterPrice,
    location,
    lesserArea,
    greaterArea,
    isItForRental,
  } = queryObject;
  if (
    roomNumber !== undefined &&
    lesserPrice !== undefined &&
    greaterPrice !== undefined &&
    lesserArea !== undefined &&
    greaterArea !== undefined &&
    location !== undefined &&
    isItForRental !== undefined
  ) {
    return {
      location: {
        $regex: location,
        $options: "gi",
      },
      price: { $gt: lesserPrice, $lt: greaterPrice },
      area: { $gt: lesserArea, $lt: greaterArea },
      room_number: roomNumber,
      isItForRental: isItForRental,
    };
  } else {
    return {};
  }
}
function searchByLocationAndRoomNum(room_number, location) {
  if (room_number !== undefined && location !== undefined) {
    return {
      location: { $regex: location, $options: "i" },
      room_number: room_number,
    };
  }
  if (room_number !== undefined) {
    return {
      room_number: room_number,
    };
  }
  if (location !== undefined) {
    return {
      location: { $regex: location, $options: "i" },
    };
  }
  return;
}
function searchByStatus(isRental) {
  if (isRental === undefined) {
    return {};
  }
  return { isItForRental: isRental };
}
function searchByType(Type) {
  if (Type === undefined) {
    return {};
  }
  return { typeOfProperty: { $regex: Type, $options: "i" } };
}

function searchForArea(lessArea = undefined, greatArea = undefined) {
  if (lessArea !== undefined && greatArea !== undefined) {
    return {
      $gte: lessArea,
      $lt: greatArea,
    };
  } else if (greatArea !== undefined) {
    return {
      $lte: greatArea,
    };
  } else if (lessArea !== undefined) {
    return {
      $gte: lessArea,
    };
  } else {
    return;
  }
}

function checkForSearchParameters(RequestQuery) {
  let filter = false;
  let arrayOfFields = [
    "roomNumber",
    "lesserPrice",
    "greaterPrice",
    "lesserArea",
    "greaterArea",
    "location",
    "isItForRental",
    "type",
  ];
  Object.keys(RequestQuery).forEach((element) => {
    if (arrayOfFields.includes(element)) {
      filter = true;
    } else {
      filter = false;
    }
  });
  console.log(filter);
  return filter;
}
module.exports = { ApiFeatures };

// const _ = require("lodash");

// const query = _.pickBy(
//   {
//     room_number: this.RequestQuery.roomNumber,
//     location:
//       this.RequestQuery.location !== undefined
//         ? { $regex: `${this.RequestQuery.location}`, $options: "i" }
//         : undefined,
//     price:
//       this.RequestQuery.greaterPrice !== undefined &&
//       this.RequestQuery.lesserPrice !== undefined
//         ? {
//             $lt: this.RequestQuery.greaterPrice,
//             $gte: this.RequestQuery.lesserPrice,
//           }
//         : undefined,
//     area:
//       this.RequestQuery.greaterArea !== undefined &&
//       this.RequestQuery.lesserArea !== undefined
//         ? {
//             $lte: this.RequestQuery.greaterArea,
//             $gte: this.RequestQuery.lesserArea,
//           }
//         : undefined,
//     isItForRental: this.RequestQuery.isItForRental,
//   },
//   _.identity
// );
