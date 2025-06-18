const express = require('express');
const router = express.Router();
const linkController = require('../Controllers/linkController');

router.post('/', linkController.createLink);
router.get('/', linkController.getAllLinks);
router.get('/:id', linkController.getLinkById);
router.put('/:id', linkController.updateLink);
router.delete('/:id', linkController.deleteLink);
router.get('/:id/stats', linkController.getLinkStats);

module.exports = router;
