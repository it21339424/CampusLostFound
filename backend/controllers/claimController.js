const Claim = require("../models/Claim");
const Item = require("../models/Item");

// CREATE CLAIM
exports.createClaim = async (req, res) => {
  try {
    const { itemId, claimReason } = req.body;

    if (!itemId || !claimReason) {
      return res.status(400).json({
        message: "Item ID and claim reason are required",
      });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // BUSINESS RULE
    if (item.status === "Claimed") {
      return res.status(400).json({
        message: "This item has already been claimed",
      });
    }

    const existingClaim = await Claim.findOne({
      itemId,
      userId: req.user.id,
      status: "Pending",
    });

    if (existingClaim) {
      return res.status(400).json({
        message: "You already have a pending claim for this item",
      });
    }

    const claim = await Claim.create({
      itemId,
      userId: req.user.id,
      claimReason,
    });

    res.status(201).json({
      message: "Claim created successfully",
      claim,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET ALL CLAIMS
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("itemId", "itemName category status image")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET ONE CLAIM
exports.getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("itemId", "itemName category description status image")
      .populate("userId", "name email");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE CLAIM REASON
exports.updateClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    if (claim.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this claim",
      });
    }

    if (claim.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending claims can be updated",
      });
    }

    const { claimReason } = req.body;

    if (claimReason) {
      claim.claimReason = claimReason;
    }

    await claim.save();

    res.status(200).json({
      message: "Claim updated successfully",
      claim,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE CLAIM STATUS
exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected",
      });
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    const item = await Item.findById(claim.itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    // Only person who created/found the item can approve or reject
    if (item.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the item owner can approve or reject claims",
      });
    }

    if (claim.status !== "Pending") {
      return res.status(400).json({
        message: "This claim has already been processed",
      });
    }

    if (status === "Approved") {
      if (item.status === "Claimed") {
        return res.status(400).json({
          message: "Item has already been claimed",
        });
      }

      claim.status = "Approved";
      item.status = "Claimed";

      await item.save();
    } else {
      claim.status = "Rejected";
    }

    await claim.save();

    res.status(200).json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim,
      itemStatus: item.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE CLAIM
exports.deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    if (claim.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this claim",
      });
    }

    if (claim.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending claims can be deleted",
      });
    }

    await claim.deleteOne();

    res.status(200).json({
      message: "Claim deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};