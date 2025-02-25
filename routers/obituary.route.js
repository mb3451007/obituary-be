const express = require('express');
const multer = require('multer');
const authenticationMiddleware = require('../middlewares/authentication');

const router = express.Router();
const obituaryController = require('../controllers/obituary.controller');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadFields = upload.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'deathReport', maxCount: 1 },
]);

router.post(
  '/',
  [authenticationMiddleware, uploadFields],
  obituaryController.createObituary
);
router.get('/', obituaryController.getObituary);
router.patch(
  '/:id',
  [authenticationMiddleware, uploadFields],
  obituaryController.updateObituary
);
router.patch('/visits/:id', obituaryController.updateVisitCounts);

module.exports = router;
