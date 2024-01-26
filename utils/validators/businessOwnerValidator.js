const slugify = require("slugify");
const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createbusinessValidator = [
  check("businessName")
    .notEmpty()
    .withMessage("businessName required")
    .isLength({ min: 2 })
    .withMessage("Too short businessName name")
    .isLength({ max: 32 })
    .withMessage("Too long businessName name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("user")
    .notEmpty()
    .withMessage("businessName must be belong to user")
    .isMongoId()
    .withMessage("Invalid user id format"),
  validatorMiddleware,
];
