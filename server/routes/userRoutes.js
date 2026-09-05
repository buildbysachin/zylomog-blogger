const express = require("express");
const { updateMe, getUsers, updateUserByAdmin, deleteUser } = require("../controllers/userController");
const { protect, isAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { updateProfileSchema } = require("../utils/schemas");

const router = express.Router();

router.put("/me", protect, validate(updateProfileSchema), updateMe);

router.get("/", protect, isAdmin, getUsers);
router.put("/:id", protect, isAdmin, updateUserByAdmin);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;
