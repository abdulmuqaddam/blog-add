'use server';

// Server Actions for User Management
import dbConnect from '../db';
import User from '../models/User';
import { cookies } from 'next/headers';
import { verifyToken } from '../auth';
import bcrypt from 'bcryptjs';

/**
 * Get all users (for admin dashboard)
 * @returns {Array} Array of all users
 */
export async function getAllUsers() {
  try {
    await dbConnect();
    const users = await User.find().sort({ createdAt: -1 });
    return { success: true, users: JSON.parse(JSON.stringify(users)) };
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, message: 'Failed to fetch users', users: [] };
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
export async function getUserById(userId) {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error('Get user by ID error:', error);
    return { success: false, message: 'Failed to fetch user' };
  }
}

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Object} Result object
 */
export async function createUser(userData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to create a user' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    // Check if email already exists
    await dbConnect();
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password || 'password123', 10);
    
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });
    
    return { success: true, message: 'User created successfully', user: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, message: 'Failed to create user' };
  }
}

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Object} Result object
 */
export async function updateUser(userId, userData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to update a user' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    // Only admins and superadmins can update users
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return { success: false, message: 'Not authorized to update users' };
    }
    
    await dbConnect();
    
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // If email is being changed, check if it already exists
    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return { success: false, message: 'Email already registered' };
      }
    }
    
    // If password is being changed, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });
    
    return { success: true, message: 'User updated successfully', user: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, message: 'Failed to update user' };
  }
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Object} Result object
 */
export async function deleteUser(userId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to delete a user' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    // Only admins and superadmins can delete users
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return { success: false, message: 'Not authorized to delete users' };
    }
    
    await dbConnect();
    
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Prevent self-deletion
    if (userId === decoded.userId) {
      return { success: false, message: 'Cannot delete your own account' };
    }
    
    await User.findByIdAndDelete(userId);
    
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: 'Failed to delete user' };
  }
}

/**
 * Toggle user active status
 * @param {string} userId - User ID
 * @returns {Object} Result object
 */
export async function toggleUserActive(userId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, message: 'Please login to toggle user status' };
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return { success: false, message: 'Invalid token' };
    }
    
    // Only admins and superadmins can toggle user status
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return { success: false, message: 'Not authorized to update user status' };
    }
    
    await dbConnect();
    
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Prevent self-deactivation
    if (userId === decoded.userId) {
      return { success: false, message: 'Cannot toggle your own account status' };
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: !user.isActive },
      { new: true }
    );
    
    return { 
      success: true, 
      message: updatedUser.isActive ? 'User activated successfully' : 'User deactivated successfully',
      user: JSON.parse(JSON.stringify(updatedUser))
    };
  } catch (error) {
    console.error('Toggle user status error:', error);
    return { success: false, message: 'Failed to toggle user status' };
  }
}

