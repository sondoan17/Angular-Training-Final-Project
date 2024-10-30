const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const emailService = require('../services/emailService');

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleAuth);

router.post('/test-ses', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Generate a test token
    const testToken = 'test-token-' + Date.now();
    
    // Send test email
    await emailService.sendPasswordResetEmail(email, testToken);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      details: {
        sentTo: email,
        testToken: testToken
      }
    });
  } catch (error) {
    console.error('SES Test Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
