const axios = require('axios');

/**
 * Sends SMS notification to a Philippine mobile number via Semaphore API.
 * @param {String} recipientPhone - Resident's mobile number (e.g. 09171234567 or +639171234567)
 * @param {String} messageText - SMS notification body
 */
const sendSMS = async (recipientPhone, messageText) => {
  try {
    const apiKey = process.env.SEMAPHORE_API_KEY;
    const senderName = process.env.SEMAPHORE_SENDER_NAME || 'BrgyConnect';

    if (!recipientPhone) {
      console.log('⚠️ SMS Warning: No recipient phone number provided.');
      return false;
    }

    // Sanitize mobile number format to standard 11-digit or 63 format
    let cleanPhone = recipientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('63')) {
      cleanPhone = '0' + cleanPhone.slice(2);
    }

    if (!apiKey) {
      console.log(`\n📱 [SMS DEV LOG - Simulated Dispatch]`);
      console.log(`To: ${cleanPhone}`);
      console.log(`From: ${senderName}`);
      console.log(`Message: "${messageText}"\n`);
      return { success: true, simulated: true };
    }

    // Live Semaphore API dispatch
    const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
      apikey: apiKey,
      number: cleanPhone,
      message: messageText,
      sendername: senderName,
    });

    console.log(`✅ SMS successfully dispatched to ${cleanPhone}:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ SMS Sending Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };
