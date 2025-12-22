import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import { check, validationResult } from "express-validator";
import { generateId } from "../utils/idGenerator.js";

const validateUser = [
  check("username")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Username is required!")
    .isLength({ min: 4, max: 20 })
    .withMessage(
      "Invalid Username, username must contain a minimum of 4 characters"
    ),
  check("phone")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Phone Number is required!")
    .isLength({ min: 10, max: 10 })
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  check("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({ min: 5 })
    .withMessage("Password must contain at least 5 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/
    )
    .withMessage(
      "Password must include at least one uppercase letter, one lowercase letter, and one special character (@$!%*?&)"
    ),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors to be more user-friendly
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));
    return res.status(400).json({
      message: "Validation failed",
      errors: formattedErrors
    });
  }
  next();
};

const createUser = asyncHandler(async (req, res) => {
  console.log("Received registration request:", req.body);

  const { username, phone, email, password, gender, dateOfBirth, image } = req.body;

  // Validate Age (Must be 18+)
  if (!dateOfBirth) {
    return res.status(400).json({ message: "Date of Birth is required." });
  }

  const dobDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return res.status(400).json({ message: "You must be at least 18 years old to register." });
  }

  // Check if email or phone already exists
  console.log("Checking for existing email:", email);
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    console.log("Email already exists:", email);
    return res.status(400).json({ message: "Email already exists" });
  }

  console.log("Checking for existing phone:", phone);
  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    console.log("Phone already exists:", phone);
    return res.status(400).json({ message: "Phone number already exists" });
  }

  // Check if this is the first user (no users in database)
  console.log("Checking user count");
  const userCount = await User.countDocuments();
  const isFirstUser = userCount === 0;
  console.log("User count:", userCount, "Is first user:", isFirstUser);

  // Hash password
  console.log("Hashing password");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Password hashed successfully");

  // Generate custom User ID
  let prefix = "FSU";
  let seqName = "user";

  if (isFirstUser) {
    prefix = "FSS";
    seqName = "superAdmin";
  }

  const userId = await generateId(prefix, seqName);

  const newUser = new User({
    userId,
    username,
    phone,
    email,
    password: hashedPassword,
    gender,
    dateOfBirth,
    image,
    isAdmin: isFirstUser, // First user becomes admin
  });

  try {
    console.log("Saving new user:", newUser);
    await newUser.save();
    console.log("User saved successfully:", newUser._id);

    // Generate token and handle any errors
    try {
      console.log("Generating token for user:", newUser._id);
      createToken(res, newUser._id);
      console.log("Token generated successfully");
    } catch (tokenError) {
      console.error("Error generating token:", tokenError);
      return res.status(500).json({
        message: "Error generating authentication token",
        error: process.env.NODE_ENV === 'development' ? tokenError.message : undefined
      });
    }

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      phone: newUser.phone,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      gender: newUser.gender,
      dateOfBirth: newUser.dateOfBirth,
      image: newUser.image,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors
      });
    }
    // For other errors
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const validateLogin = [
  check("email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email is missing!")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  createToken(res, existingUser._id);

  res.status(200).json({
    _id: existingUser._id,
    username: existingUser.username,
    phone: existingUser.phone,
    email: existingUser.email,
    isAdmin: existingUser.isAdmin,
    isSuperAdmin: existingUser.userId && existingUser.userId.startsWith('FSS'),
    gender: existingUser.gender,
    dateOfBirth: existingUser.dateOfBirth,
    image: existingUser.image,
  });
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({
    _id: user._id,
    username: user.username,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    image: user.image,
  });
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const { username, phone, email, password, image } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  if (username) user.username = username;
  if (image !== undefined) user.image = image;

  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists && phoneExists._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    user.phone = phone;
  }

  if (email) {
    const emailExists = await User.findOne({ email });
    if (emailExists && emailExists._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Email already exists" });
    }
    user.email = email;
  }

  if (req.body.gender) {
    user.gender = req.body.gender;
  }

  if (req.body.dateOfBirth) {
    const dob = new Date(req.body.dateOfBirth);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      return res.status(400).json({ message: "You must be at least 18 years old." });
    }
    user.dateOfBirth = dob;
  }

  try {
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      phone: updatedUser.phone,
      email: updatedUser.email,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { id } = req.params;

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "New password and confirm password do not match" });
  }

  let user;

  if (req.user.isAdmin) {
    user = await User.findById(id);
  } else {
    user = await User.findById(req.user._id);
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Incorrect current password" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;

  await user.save();

  res.json({ message: "Password updated successfully" });
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  if (user.isAdmin) {
    res.status(400).json({ message: "Cannot delete admin user" });
    return;
  }

  await User.deleteOne({ _id: user._id });
  res.json({ message: "User removed" });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
});

const updateUserById = asyncHandler(async (req, res) => {
  const { username, phone, email, gender, isActive, dateOfBirth } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    user.gender = gender || user.gender;
    if (isActive !== undefined) user.isActive = isActive;
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const ageDiffMs = Date.now() - dob.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      if (age < 18) {
        return res.status(400).json({ message: "User must be at least 18 years old" });
      }
      user.dateOfBirth = dob;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      phone: updatedUser.phone,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      gender: updatedUser.gender,
      isActive: updatedUser.isActive,
      dateOfBirth: updatedUser.dateOfBirth,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res
      .status(400)
      .json({ message: "Error updating user", error: error.message });
  }
});

export {
  validateUser,
  handleValidationErrors,
  createUser,
  validateLogin,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  changePassword,
  createUserByAdmin,
};

const createUserByAdmin = asyncHandler(async (req, res) => {
  const { username, phone, email, password, isAdmin, gender, dateOfBirth } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    return res.status(400).json({ message: "Phone number already exists" });
  }

  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      return res.status(400).json({ message: "User must be at least 18 years old" });
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate custom User ID
  const prefix = isAdmin ? "FSA" : "FSU";
  const seqName = isAdmin ? "admin" : "user";
  const userId = await generateId(prefix, seqName);

  const newUser = new User({
    userId,
    username,
    phone,
    email,
    password: hashedPassword,
    isAdmin: Boolean(isAdmin),
    gender: gender || "Other",
    isActive: true, // Default to true on creation
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
  });

  try {
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      phone: newUser.phone,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      gender: newUser.gender,
      isActive: newUser.isActive,
      dateOfBirth: newUser.dateOfBirth,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid user data" });
  }
});