const express = require('express');
const router = express.Router();
const {
  createIssue, getIssues, getIssueById, updateIssueStatus, getMyIssues
} = require('../controllers/issueController');
const { auth, authority } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateUuidParam } = require('../middleware/validate');

router.post('/', auth, upload.single('image'), createIssue);
router.get('/mine', auth, getMyIssues);
router.get('/', auth, getIssues);
router.get('/:id', auth, validateUuidParam(), getIssueById);
router.put('/:id/status', auth, authority, validateUuidParam(), updateIssueStatus);

module.exports = router;