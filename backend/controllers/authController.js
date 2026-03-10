const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
// const { sendEmail } = require('../utils/emailService');

const prisma = new PrismaClient({
  // Use the library engine explicitly
  __internal: {
    engine: {
      type: 'library'
    }
  }
});

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const vToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name, 
        verificationToken: vToken 
      }
    });

    // const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${vToken}`;
    // await sendEmail(email, "Verify Your Email - Himalayan Spice", `
    //   <h1>Welcome ${name}!</h1>
    //   <p>Please verify your email by clicking the link below:</p>
    //   <a href="${verifyUrl}">${verifyUrl}</a>
    // `);

    res.status(201).json({ message: "Success! Please check your email to verify account." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// 2. VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });
    res.json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// 3. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: "Login error. msg: " + err.message });
  }
};

// 4. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const rToken = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken: rToken, resetTokenExpiry: expiry }
  });

//   const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rToken}`;
//   await sendEmail(email, "Reset Password - Himalayan Spice", `
//     <p>You requested a password reset. Click the link below:</p>
//     <a href="${resetUrl}">Reset Password</a>
//   `);

  res.json({ message: "Reset link sent to your email." });
};