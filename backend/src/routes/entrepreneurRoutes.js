const express = require('express');
const router = express.Router();
const {
  getCategories, createProfile, getMyProfile, updateProfile
} = require('../controllers/entrepreneurController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/categories', getCategories);
router.post('/profile', auth, upload.single('image'), createProfile);
router.get('/profile/me', auth, getMyProfile);
router.put('/profile', auth, upload.single('image'), updateProfile);

module.exports = router;