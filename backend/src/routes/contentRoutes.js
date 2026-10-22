const express = require('express');
const router = express.Router();
const {
  getContent, getAllContent, createContent, updateContent, deleteContent,
  getComplaints, createComplaint, updateComplaintStatus
} = require('../controllers/adminContentController');
const { auth, admin } = require('../middleware/auth');
const { validateUuidParam } = require('../middleware/validate');

// Public reading of published guidance content
router.get('/', getContent);

// Complaints - any authenticated user can create; admin manages
router.post('/complaints', auth, createComplaint);
router.get('/complaints', auth, admin, getComplaints);
router.put('/complaints/:id/status', auth, admin, validateUuidParam(), updateComplaintStatus);

// Content management - admin only
router.get('/all', auth, admin, getAllContent);
router.post('/', auth, admin, createContent);
router.put('/:id', auth, admin, validateUuidParam(), updateContent);
router.delete('/:id', auth, admin, validateUuidParam(), deleteContent);

module.exports = router;