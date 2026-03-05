// Email utility using nodemailer
import nodemailer from 'nodemailer';

// Get SMTP configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.SMTP_FROM || '"Blog Newsletter" <newsletter@yourblog.com>',
};

// Log SMTP config on load (masked password)
console.log('📧 Email Config Check:');
console.log('   SMTP_HOST:', SMTP_CONFIG.host);
console.log('   SMTP_PORT:', SMTP_CONFIG.port);
console.log('   SMTP_USER:', SMTP_CONFIG.user || '❌ NOT SET');
console.log('   SMTP_PASS:', SMTP_CONFIG.pass ? '✅ Set (length: ' + SMTP_CONFIG.pass.length + ')' : '❌ NOT SET');
console.log('   SMTP_FROM:', SMTP_CONFIG.from);

// Check if SMTP is properly configured
const isSMTPConfigured = () => {
  const configured = !!(SMTP_CONFIG.user && SMTP_CONFIG.pass);
  console.log('   Ready:', configured ? '✅ YES - Will send real emails' : '❌ NO - Simulation mode');
  return configured;
};

/**
 * Send email to multiple subscribers
 */
export async function sendBulkEmails({ recipients, subject, html, text, onProgress }) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  console.log(`\n📧 Starting email send...`);
  console.log(`   Total recipients: ${recipients.length}`);
  console.log(`   Subject: ${subject}`);

  const smtpReady = isSMTPConfigured();

  if (!smtpReady) {
    // Simulation mode
    for (let i = 0; i < recipients.length; i++) {
      results.success++;
      if (onProgress) {
        onProgress({ current: i + 1, total: recipients.length, success: results.success, failed: results.failed });
      }
    }
    return results;
  }

  // REAL SMTP sending
  console.log('\n🔐 Creating SMTP transporter...');
  
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass,
      },
    });
    console.log('   Transporter created ✅');
  } catch (err) {
    console.error('   Transporter creation FAILED:', err.message);
    results.failed = recipients.length;
    results.errors.push({ error: 'Transporter error: ' + err.message });
    return results;
  }

  // Verify connection
  console.log('   Verifying SMTP connection...');
  try {
    await transporter.verify();
    console.log('   Connection verified ✅\n');
  } catch (err) {
    console.error('   Connection verification FAILED:', err.message);
    console.error('   This usually means:');
    console.error('   - Wrong email/password');
    console.error('   - Less secure apps disabled (use App Password for Gmail)');
    console.error('   - 2FA not enabled on Gmail\n');
    results.failed = recipients.length;
    results.errors.push({ error: 'Connection failed: ' + err.message });
    return results;
  }

  // Send each email
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      const info = await transporter.sendMail({
        from: SMTP_CONFIG.from,
        to: recipient.email,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });
      results.success++;
      console.log(`   ✅ ${recipient.email} - Message ID: ${info.messageId.substring(0, 20)}...`);
    } catch (err) {
      results.failed++;
      const errorMsg = err.message;
      results.errors.push({ email: recipient.email, error: errorMsg });
      console.error(`   ❌ ${recipient.email} - ${errorMsg}`);
    }

    if (onProgress) {
      onProgress({ current: i + 1, total: recipients.length, success: results.success, failed: results.failed });
    }

    // Delay to avoid rate limiting
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`\n📊 Result: ${results.success} ✅ sent, ${results.failed} ❌ failed\n`);
  return results;
}

// Export for use in subscriberActions
export { SMTP_CONFIG, isSMTPConfigured };

export default { sendBulkEmails, SMTP_CONFIG, isSMTPConfigured };

