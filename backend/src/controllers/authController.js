const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User, Employee } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokens');

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    console.log(`Login attempt for email: ${email.trim().toLowerCase()}`);

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      console.log('User is inactive');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log(`Password valid: ${valid}`);

    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const employee = user.employeeId ? await Employee.findByPk(user.employeeId) : null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          themePreference: user.themePreference,
          employee: employee
            ? {
                id: employee.id,
                employeeCode: employee.employeeCode,
                firstName: employee.firstName,
                lastName: employee.lastName,
                fullName: `${employee.firstName} ${employee.lastName}`,
                designation: employee.designation,
                departmentId: employee.departmentId,
                profilePicture: employee.profilePicture,
              }
            : null,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    next(err);
  }
}

// POST /api/auth/refresh
async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(payload.sub);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  await User.update({ refreshToken: null }, { where: { id: req.user.id } });
  res.json({ success: true, message: 'Logged out successfully' });
}

// GET /api/auth/me
async function me(req, res) {
  const user = await User.findByPk(req.user.id);
  const employee = user.employeeId ? await Employee.findByPk(user.employeeId) : null;
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      themePreference: user.themePreference,
      employee: employee
        ? {
            id: employee.id,
            employeeCode: employee.employeeCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: `${employee.firstName} ${employee.lastName}`,
            designation: employee.designation,
            departmentId: employee.departmentId,
            profilePicture: employee.profilePicture,
          }
        : null,
    },
  });
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ where: { email: email?.toLowerCase() } });

  // Always return success to avoid leaking which emails are registered
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // In production this would call nodemailer's sendMail() with a reset link.
  // For this demo, the token is returned in the response so the flow can be tested end-to-end.
  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent',
    devResetToken: token,
  });
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  const user = await User.findOne({ where: { resetPasswordToken: token } });
  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ success: true, message: 'Password has been reset successfully' });
}

module.exports = { login, refresh, logout, me, forgotPassword, resetPassword };
