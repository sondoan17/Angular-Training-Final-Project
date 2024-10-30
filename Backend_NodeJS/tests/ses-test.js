require('dotenv').config();
const EmailService = require('../services/emailService');

async function testSES() {
  console.log('Starting SES test...');
  console.log('Using AWS Region:', process.env.AWS_REGION);
  console.log('Verified Email:', process.env.SES_VERIFIED_EMAIL);

  try {
    // Test connection
    console.log('\nTesting SES connection...');
    const connectionTest = await EmailService.testConnection();
    console.log('Connection test result:', connectionTest);

    if (connectionTest.success) {
      // Send test email
      console.log('\nSending test email...');
      await EmailService.sendPasswordResetEmail(
        process.env.SES_VERIFIED_EMAIL,
        'test-token-' + Date.now()
      );
      console.log('Test email sent successfully!');
    }
  } catch (error) {
    console.error('\nTest failed:', error);
    console.error('\nAWS Error Details:', {
      code: error.Code,
      message: error.message,
      requestId: error.$metadata?.requestId
    });
  }
}

// Run the test
testSES(); 