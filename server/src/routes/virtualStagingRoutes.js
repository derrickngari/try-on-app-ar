const express = require('express');
const router = express.Router();
const { virtualStage } = require('../controllers/virtualStagingController');

router.post('/', virtualStage);

module.exports = router;
