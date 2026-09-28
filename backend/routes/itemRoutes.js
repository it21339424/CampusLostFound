const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

router.post(
  "/",
  protect,
  upload.single("image"),
  createItem
);

router.get("/", getAllItems);

router.get("/:id", getItemById);

router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateItem
);

router.delete(
  "/:id",
  protect,
  deleteItem
);

module.exports = router;