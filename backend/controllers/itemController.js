const Item = require("../models/Item");

// CREATE ITEM
exports.createItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      description,
      locationFound,
      dateFound,
    } = req.body;

    if (
      !itemName ||
      !category ||
      !description ||
      !locationFound ||
      !dateFound
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const item = await Item.create({
      itemName,
      category,
      description,
      locationFound,
      dateFound,
      image: req.file ? req.file.filename : "",
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET ALL ITEMS
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// GET ONE ITEM
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to update this item",
      });
    }

    const {
      itemName,
      category,
      description,
      locationFound,
      dateFound,
      status,
    } = req.body;

    if (itemName) item.itemName = itemName;
    if (category) item.category = category;
    if (description) item.description = description;
    if (locationFound) item.locationFound = locationFound;
    if (dateFound) item.dateFound = dateFound;
    if (status) item.status = status;

    if (req.file) {
      item.image = req.file.filename;
    }

    await item.save();

    res.status(200).json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not allowed to delete this item",
      });
    }

    await item.deleteOne();

    res.status(200).json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};