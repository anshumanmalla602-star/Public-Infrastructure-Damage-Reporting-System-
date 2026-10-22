const express = require('express');
const router = express.Router();
const {
  getCategories, createCategory, updateCategory, deleteCategory,
  getPendingProfiles, getAllProfiles, updateProfileStatus
} = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');
const { validateUuidParam } = require('../middleware/validate');

router.use(auth, admin);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', validateUuidParam(), updateCategory);
router.delete('/categories/:id', validateUuidParam(), deleteCategory);

router.get('/profiles/pending', getPendingProfiles);
router.get('/profiles', getAllProfiles);
router.put('/profiles/:id/status', validateUuidParam(), updateProfileStatus);

module.exports = router;