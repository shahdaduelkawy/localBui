const slugify = require('slugify');
const { check } = require('express-validator');
const validatorMiddleware = require('../../middleware/validatorMiddleware');
const User = require('../../models/userModel');

exports.createAdminValidator = [
  check('name')
    .notEmpty()
    .withMessage('Admin name required')
    .isLength({ min: 3 })
    .withMessage('Too short User name')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),

  check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('Password Confirmation incorrect');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation required'),

  
  check('role').optional(),

  validatorMiddleware,
];

exports.deleteUsersValidator = [
  check('id').isMongoId().withMessage('Invalid Admin id format'),

  validatorMiddleware,
];

exports.deleteBusinessValidator = [
  check('id').isMongoId().withMessage('Invalid Admin id format'),

  validatorMiddleware,
];

exports.getSearchValidator = [
  check('id').isMongoId().withMessage('Invalid Search id format'),
  validatorMiddleware,
];
