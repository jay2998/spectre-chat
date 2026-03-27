import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json("User created.");
  } catch (err) {
    if (err.code === 11000) return res.status(400).json("Username or email already exists.");
    res.status(500).json("Something went wrong.");
  }
};

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).json("User not found.");

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).json("Wrong password.");

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await User.findByIdAndUpdate(user._id, { isOnline: true });

    const isProduction = process.env.NODE_ENV === "production";
    const { password, ...info } = user._doc;
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json(info);
  } catch (err) {
    res.status(500).json("Something went wrong.");
  }
};

export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    await User.findByIdAndUpdate(req.userId, { isOnline: false, lastSeen: Date.now() });
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      path: "/",
    }).status(200).json("Logged out.");
  } catch (err) {
    res.status(500).json("Logout failed.");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.userId, { $set: req.body }, { new: true });
    const { password, ...info } = updatedUser._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json("Update failed.");
  }
};
