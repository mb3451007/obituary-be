const express = require("express");
const multer = require("multer");
const authenticationMiddleware = require("../middlewares/authentication");

const router = express.Router();
const obituaryController = require("../controllers/obituary.controller");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
});

const uploadFields = upload.fields([
  { name: "picture", maxCount: 1 },
  { name: "deathReport", maxCount: 1 },
]);

router.post("/", [uploadFields], obituaryController.createObituary);
router.get("/", obituaryController.getObituary);
router.get("/funerals", obituaryController.getFunerals);
router.get("/memory", obituaryController.getMemory);
router.get(
  "/pending-data",
  [authenticationMiddleware],
  obituaryController.getPendingData
);
// for memory page
// router.patch(
//   "/:id",
//   [authenticationMiddleware, uploadFields],
//   obituaryController.updateObituary
// );
router.patch("/:id", [uploadFields], obituaryController.updateObituary);
router.patch("/visits/:id", obituaryController.updateVisitCounts);

module.exports = router;
