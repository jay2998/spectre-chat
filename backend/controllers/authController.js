import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 5);
    const user = new User({ ...req.body, password: hash });
    await user.save();
    res.status(201).json("User created.");
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json("Username or email already exists.");
    res.status(500).json("Something went wrong.");
  }
};

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(404).json("User not found.");

    const match = bcrypt.compareSync(req.body.password, user.password);
    if (!match) return res.status(400).json("Wrong password.");

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    await User.findByIdAndUpdate(user._id, { isOnline: true });

    const { password, ...info } = user._doc;
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
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
    await User.findByIdAndUpdate(req.userId, {
      isOnline: false,
      lastSeen: Date.now(),
    });
    res
      .clearCookie("accessToken", {
        sameSite: "lax",
      })
      .status(200)
      .json("Logged out.");
  } catch (err) {
    res.status(500).json("Something went wrong.");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { avatar: req.body.avatar, bio: req.body.bio },
      { new: true },
    );
    const { password, ...info } = updated._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json("Something went wrong.");
  }
};
