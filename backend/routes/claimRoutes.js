const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createClaim,
  getAllClaims,
  getClaimById,
  updateClaim,
  updateClaimStatus,
  deleteClaim,
} = require("../controllers/claimController");

router.post("/", protect, createClaim);

router.get("/", protect, getAllClaims);

router.get("/:id", protect, getClaimById);

router.put("/:id", protect, updateClaim);

router.patch("/:id/status", protect, updateClaimStatus);

router.delete("/:id", protect, deleteClaim);

module.exports = router;