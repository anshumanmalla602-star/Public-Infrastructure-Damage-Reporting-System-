const express = require('express');
const router = express.Router();
const {
  createService, getMyServices, getAllServices, getServiceById, updateService, deleteService
} = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateUuidParam } = require('../middleware/validate');

router.get('/mine', auth, getMyServices);
router.get('/', getAllServices);
router.post('/', auth, upload.single('image'), createService);
router.get('/:id', validateUuidParam(), getServiceById);
router.put('/:id', auth, validateUuidParam(), updateService);
router.delete('/:id', auth, validateUuidParam(), deleteService);

module.exports = router;