const express = require("express");
const router = express.Router();
const { checkInputs, generateToken } = require("../middlewares/userMiddleware");
const { handleUserRegister, handleUserLogin, handleUserDelete, handleUpdateProfile, handleChangePassword, handleVerifyUser } = require("../controllers/userController");
router.post("/register", checkInputs, handleUserRegister);
router.post("/login", generateToken, handleUserLogin);
router.delete('/delete-account/:id', handleUserDelete);
router.post("/update-profile", handleUpdateProfile);
router.post("/change-password", handleChangePassword);
router.post("/verify-user", handleVerifyUser);
module.exports = router;