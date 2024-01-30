const express = require('express');
const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authValidator');

const authService = require('../services/authService'); // Import authService

const {
  signup,
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = authService; // Destructure authService methods

const businessOwnersRoute = require('./businessOwnerRoute');

const router = express.Router();
router.use('/:userId/businessOwners', businessOwnersRoute);

router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);
router.post('/forgotPassword', forgotPassword);
router.post('/verifyResetCode', verifyPassResetCode);
router.put('/resetPassword', resetPassword);

// Use authService for updating user data
router.put('/updateUserData/:userId', async (req, res) => {
  const { userId } = req.params;
  const updateCriteria = req.body;

  try {
    const updatedUser = await authService.updateUserData(userId, updateCriteria);

    if (updatedUser) {
      res.status(200).json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
