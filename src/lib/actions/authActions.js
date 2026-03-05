'use server';

// Server Actions for Authentication
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dbConnect from '../db';
import User from '../models/User';
import { signToken, verifyToken } from '../auth';
import bcrypt from 'bcryptjs';

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Result object with success status and message
 */
export async function login(email, password) {
  try {
    await dbConnect();
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    if (!user.isActive) {
      return { success: false, message: 'Account is deactivated' };
    }
    
    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return { 
      success: true, 
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
}

/**
 * Register new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (optional)
 * @returns {Object} Result object with success status and message
 */
export async function register(name, email, password, role = 'user') {
  try {
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    
    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    
    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return { 
      success: true, 
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An error occurred during registration' };
  }
}

/**
 * Logout user
 * @returns {Object} Result object with success status and message
 */
export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    
    redirect('/login');
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'An error occurred during logout' };
  }
}

/**
 * Get current user
 * @returns {Object} Current user or null
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return null;
    }
    
    await dbConnect();
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return null;
    }
    
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || null,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

