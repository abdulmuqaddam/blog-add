'use server';

// Server Actions for Subscriber Management
import dbConnect from '../db';
import Subscriber from '../models/Subscriber';
import { sendBulkEmails, sendSingleEmail } from '../email';

/**
 * Subscribe a new user to the newsletter
 * @param {string} email - User's email address
 * @returns {Object} Result object
 */
export async function subscribeUser(email) {
  try {
    await dbConnect();

    // Validate email
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address' };
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        // Re-subscribe previously unsubscribed user
        existingSubscriber.status = 'active';
        await existingSubscriber.save();
        return { success: true, message: 'Welcome back! You have been resubscribed successfully.' };
      }
      return { success: false, message: 'This email is already subscribed to our newsletter.' };
    }

    // Create new subscriber
    await Subscriber.create({
      email: email.toLowerCase().trim(),
    });

    return { success: true, message: 'Thank you for subscribing to our newsletter!' };
  } catch (error) {
    console.error('Subscribe error:', error);
    if (error.code === 11000) {
      return { success: false, message: 'This email is already subscribed.' };
    }
    return { success: false, message: 'Failed to subscribe. Please try again.' };
  }
}

/**
 * Get all subscribers (for admin dashboard)
 * @returns {Array} Array of all subscribers
 */
export async function getAllSubscribers() {
  try {
    await dbConnect();
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    return { success: true, subscribers: JSON.parse(JSON.stringify(subscribers)) };
  } catch (error) {
    console.error('Get all subscribers error:', error);
    return { success: false, message: 'Failed to fetch subscribers', subscribers: [] };
  }
}

/**
 * Get subscriber count
 * @returns {Object} Subscriber count
 */
export async function getSubscriberCount() {
  try {
    await dbConnect();
    const count = await Subscriber.countDocuments({ status: 'active' });
    return { success: true, count };
  } catch (error) {
    console.error('Get subscriber count error:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Unsubscribe a user
 * @param {string} email - User's email address
 * @returns {Object} Result object
 */
export async function unsubscribeUser(email) {
  try {
    await dbConnect();

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    
    if (!subscriber) {
      return { success: false, message: 'Email not found in our subscribers list.' };
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    return { success: true, message: 'You have been unsubscribed successfully.' };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return { success: false, message: 'Failed to unsubscribe. Please try again.' };
  }
}

/**
 * Send newsletter to all active subscribers
 * @param {Object} data - Email data with subject and content
 * @returns {Object} Result object
 */
export async function sendNewsletter(data) {
  try {
    await dbConnect();

    const { subject, content } = data;

    if (!subject || !content) {
      return { success: false, message: 'Subject and content are required.' };
    }

    // Get all active subscribers
    const subscribers = await Subscriber.find({ status: 'active' });
    
    if (subscribers.length === 0) {
      return { success: false, message: 'No active subscribers found.' };
    }

    // Prepare email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📰 Newsletter</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>You're receiving this because you subscribed to our newsletter.</p>
              <p>© ${new Date().getFullYear()} Blogify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send bulk emails
    const recipients = subscribers.map(s => ({ email: s.email }));
    const result = await sendBulkEmails({
      recipients,
      subject,
      html
    });

    // Log any errors for debugging
    if (result.errors && result.errors.length > 0) {
      console.error('Email sending errors:', result.errors);
    }

    return { 
      success: true, 
      message: `Newsletter sent! ${result.success} delivered, ${result.failed} failed.`,
      details: result
    };
  } catch (error) {
    console.error('Send newsletter error:', error);
    return { success: false, message: 'Failed to send newsletter. Please try again.' };
  }
}

/**
 * Send email to a single subscriber
 * @param {Object} data - Email data with email, subject and content
 * @returns {Object} Result object
 */
export async function sendEmailToSubscriber(data) {
  try {
    await dbConnect();

    const { email, subject, content } = data;

    if (!email || !subject || !content) {
      return { success: false, message: 'Email, subject and content are required.' };
    }

    // Check if subscriber exists
    const subscriber = await Subscriber.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!subscriber) {
      return { success: false, message: 'Subscriber not found.' };
    }

    // Prepare email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Message</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>You're receiving this because you're subscribed to our newsletter.</p>
              <p>© ${new Date().getFullYear()} Blogify. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send single email
    const result = await sendSingleEmail({
      to: email,
      subject,
      html
    });

    if (result.success) {
      return { success: true, message: `Email sent successfully to ${email}.` };
    } else {
      return { success: false, message: `Failed to send email: ${result.error}` };
    }
  } catch (error) {
    console.error('Send single email error:', error);
    return { success: false, message: 'Failed to send email. Please try again.' };
  }
}

