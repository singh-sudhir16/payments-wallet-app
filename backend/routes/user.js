// backend/routes/user.js
const express = require('express');
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
const bcrypt = require('bcrypt');

const saltRounds = 10;
// Schema for signup request
const signupBody = zod.object({
  username: zod.string().email({ message: "Invalid email address" }),
  firstName: zod.string().min(1, { message: "First name is required" }),
  lastName: zod.string().min(1, { message: "Last name is required" }),
  password: zod.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Schema for signin request
const signinBody = zod.object({
  username: zod.string().email({ message: "Invalid email address" }),
  password: zod.string().min(1, { message: "Password is required" }),
});

// Schema for updating user details
const updateBody = zod.object({
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
  phone: zod.string().optional(),
  email: zod.string().email({ message: "Invalid email address" }),
});

// Schema for changing password
const changePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, { message: "Current password is required" }),
  newPassword: zod.string().min(6, { message: "New password must be at least 6 characters long" }),
  confirmPassword: zod.string().min(6, { message: "Confirm password must be at least 6 characters long" }),
});

// Signup endpoint
router.post("/signup", async (req, res) => {
    const parsed = signupBody.safeParse(req.body);
    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }
  
    const { username, firstName, lastName, password } = parsed.data;
  
    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({ message: "Email already taken" });
      }
  
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const user = await User.create({
        username,
        password: hashedPassword,
        firstName,
        lastName,
      });
      const userId = user._id;
  
      await Account.create({
        userId,
        balance: 100 + Math.random() * 10000,
      });
  
      const token = jwt.sign({ userId }, JWT_SECRET);
      res.json({
        message: "User created successfully",
        token,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

// Signin endpoint
router.post("/signin", async (req, res) => {
    const parsed = signinBody.safeParse(req.body);
    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ message: errorMessages });
    }
  
    const { username, password } = parsed.data;
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.json({ token });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
});
  

// Update user details endpoint
router.put("/", authMiddleware, async (req, res) => {
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Error while updating information",
      details: parsed.error.errors,
    });
  }
  
  try {
    // Find user by email (assuming email is stored as username)
    const updatedUser = await User.findOneAndUpdate(
      { username: parsed.data.email },
      {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Updated successfully", profile: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Bulk users endpoint (search by first or last name)
router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";
  try {
    const users = await User.find({
      $or: [
        { firstName: { "$regex": filter, "$options": "i" } },
        { lastName: { "$regex": filter, "$options": "i" } }
      ]
    });
  
    res.json({
      user: users.map(user => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id
      }))
    });
  } catch (error) {
    console.error("Error fetching bulk users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Profile details endpoint
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.username, // assuming username is the email
        phone: user.phone || ""
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password endpoint
router.put("/change-password", authMiddleware, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", details: parsed.error.errors });
  }
  
  // Check if new password matches confirm password
  if (req.body.newPassword !== req.body.confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }
  
  try {
    // Find the user (assuming req.userId is set by authMiddleware)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Validate the current password (this example uses plaintext; in production, use hashed passwords)
    if (user.password !== req.body.currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Update the password
    user.password = req.body.newPassword;
    await user.save();
    
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
