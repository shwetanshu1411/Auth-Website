import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// register function
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7D",
    });

    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use true only in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", // For production cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, // Set maxAge as milliseconds (7 days)
    });

    //sending welcome email
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      to: email,
      subject: `Welcome to MERN AUTH`,
      text: `welcome to our website.your account has been created successfully with email id : ${email}`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7D",
    });

    // Set the token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use true only in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", // For production cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, // Set maxAge as milliseconds (7 days)
    });

    return res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// logout function
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      secure: process.env.NODE_ENV === "production", // Use true only in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });
    return res.json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }
    const otp = String(Math.floor(1000 + Math.random() * 9000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      to: user.email,
      subject: `Account Verification OTP`,
      text: `Your account verification otp is ${otp}`,
    };
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp != otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
//check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "Authenticated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//reset otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() +15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      to: email,
      subject: `Password Reset OTP`,
      text: `Your OTP for resetting your password is ${otp}.
      use this OTP to reset your password`,
    };
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: `OTP sent successfully ${otp}` });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
//reset user password
export const resetpassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp != otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
