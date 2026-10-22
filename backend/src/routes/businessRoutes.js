const express = require('express');
const router = express.Router();
const {
  getApprovedBusinesses, getBusinessById, getBusinessServices, getCities
} = require('../controllers/businessController');

const { validateUuidParam } = require('../middleware/validate');

router.get('/cities', getCities);
router.get('/', getApprovedBusinesses);
router.get('/:id', validateUuidParam(), getBusinessById);
router.get('/:id/services', validateUuidParam(), getBusinessServices);

module.exports = router;