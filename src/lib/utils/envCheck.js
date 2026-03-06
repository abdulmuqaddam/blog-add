/**
 * Environment Variable Checker Utility
 * Logs warnings for missing required environment variables during development
 */

// Required environment variables for the application
const REQUIRED_ENV_VARS = {
  // Database
  DB: [
    'MONGODB_URI'
  ],
  // Authentication
  JWT: [
    'JWT_SECRET'
  ],
  // Cloudinary (Image Upload)
  CLOUDINARY: [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ],
  // Email/SMTP
  SMTP: [
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_HOST',
    'SMTP_PORT'
  ]
};

/**
 * Check if environment variables are configured
 * @param {string} env - Environment to check ('development' | 'production' | 'all')
 */
export function checkEnv(env = process.env.NODE_ENV || 'development') {
  // Only run in development or if explicitly enabled
  if (env === 'production') {
    const missing = getMissingVars();
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables in production:', missing);
    }
    return missing;
  }

  // Development mode - show warnings
  const missing = getMissingVars();
  
  if (missing.length > 0) {
    console.warn('⚠️ =======================================');
    console.warn('⚠️  Environment Variables Warning');
    console.warn('⚠️ =======================================');
    console.warn('⚠️  The following required variables are missing:\n');
    
    missing.forEach(({ category, variable }) => {
      console.warn(`   📍 ${category}: ${variable}`);
    });
    
    console.warn('\n⚠️  Some features may not work correctly.');
    console.warn('⚠️  Please add these to your .env.local file.\n');
    console.warn('⚠️ =======================================\n');
  } else {
    console.log('✅ All required environment variables are configured!');
  }

  return missing;
}

/**
 * Get list of missing environment variables
 * @returns {Array} Array of missing variables with category
 */
function getMissingVars() {
  const missing = [];
  
  // Check DB variables
  REQUIRED_ENV_VARS.DB.forEach(variable => {
    if (!process.env[variable]) {
      missing.push({ category: 'Database', variable });
    }
  });
  
  // Check JWT variables
  REQUIRED_ENV_VARS.JWT.forEach(variable => {
    if (!process.env[variable]) {
      missing.push({ category: 'Authentication', variable });
    }
  });
  
  // Check Cloudinary variables
  REQUIRED_ENV_VARS.CLOUDINARY.forEach(variable => {
    if (!process.env[variable]) {
      missing.push({ category: 'Cloudinary (Image Upload)', variable });
    }
  });
  
  // Check SMTP variables (warning only, not blocking)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    missing.push({ category: 'Email (SMTP)', variable: 'SMTP_USER/SMTP_PASS' });
  }
  
  return missing;
}

/**
 * Get environment variable status for UI display
 * @returns {Object} Status of each category
 */
export function getEnvStatus() {
  return {
    db: {
      configured: !!process.env.MONGODB_URI,
      value: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'Not set'
    },
    jwt: {
      configured: !!process.env.JWT_SECRET,
      value: process.env.JWT_SECRET ? '✓ Configured' : 'Not set'
    },
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
      apiKey: process.env.CLOUDINARY_API_KEY ? '✓ Configured' : 'Not set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '✓ Configured' : 'Not set'
    },
    smtp: {
      configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      user: process.env.SMTP_USER || 'Not set',
      host: process.env.SMTP_HOST || 'smtp.gmail.com (default)',
      port: process.env.SMTP_PORT || '587 (default)'
    }
  };
}

export default { checkEnv, getEnvStatus };

