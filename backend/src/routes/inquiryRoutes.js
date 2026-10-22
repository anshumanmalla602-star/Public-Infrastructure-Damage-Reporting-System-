const express = require('express');
const router = express.Router();
const {
  createInquiry, getMyInquiries, getReceivedInquiries, respondToInquiry
} = require('../controllers/inquiryController');
const { auth } = require('../middleware/auth');
const { validateUuidParam } = require('../middleware/validate');

router.post('/', auth, createInquiry);
router.get('/mine', auth, getMyInquiries);
router.get('/received', auth, getReceivedInquiries);
router.put('/:id/respond', auth, validateUuidParam(), respondToInquiry);

module.exports = router;