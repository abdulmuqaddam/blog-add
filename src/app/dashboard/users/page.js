'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserActive } from '@/lib/actions/userActions';
import { Users, Edit, Trash2, ToggleLeft, ToggleRight, Upload, X, Mail, Phone, MapPin, User as UserIcon, Calendar, Shield } from 'lucide-react';
import { TableSkeleton } from '@/components/SkeletonCard';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    address: '',
    role: 'user',
    avatar: '',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.users);
    } else {
      alert(result.message || 'Failed to fetch users');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let result;
    if (editingUser) {
      // Update existing user
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      result = await updateUser(editingUser._id, updateData);
    } else {
      // Create new user
      result = await createUser(formData);
    }

    if (result.success) {
      alert(result.message);
      resetForm();
      fetchUsers();
    } else {
      alert(result.message);
    }
    setSubmitting(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      contact: user.contact || '',
      address: user.address || '',
      role: user.role || 'user',
      avatar: user.avatar || '',
      password: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const result = await deleteUser(userId);
    if (result.success) {
      alert(result.message);
      fetchUsers();
    } else {
      alert(result.message);
    }
  };

  const handleToggleActive = async (userId) => {
    const result = await toggleUserActive(userId);
    if (result.success) {
      alert(result.message);
      fetchUsers();
    } else {
      alert(result.message);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      contact: '',
      address: '',
      role: 'user',
      avatar: '',
      password: '',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      superadmin: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleClasses[role] || roleClasses.user}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-indigo-600" />
          User Management
        </h1>
        <p className="text-slate-500 mt-1">Manage your platform users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side - Create/Edit Form */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              {editingUser ? (
                <>
                  <Edit className="w-5 h-5 text-indigo-600" />
                  Edit User
                </>
              ) : (
                <>
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                  Create New User
                </>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password (only for new users) */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required={!editingUser}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              {/* Contact No */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Contact No <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="Enter contact number"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    required
                    rows={2}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
                  >
                    <option value="user">User</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Image
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                  {formData.avatar ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.avatar}
                        alt="Preview"
                        className="max-h-32 rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-600 text-sm font-medium">Click to upload image</p>
                      <p className="text-slate-400 text-xs">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData((prev) => ({ ...prev, avatar: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : editingUser ? 'Update User' : 'Create User'}
                </button>
                {editingUser && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Users Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                All Users ({users.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-6">
                <div className="mb-6 flex justify-between">
                  <div className="h-8 bg-slate-200 rounded w-32 animate-pulse" />
                </div>
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon className="w-5 h-5 text-indigo-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600">{user.contact || '-'}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[120px]">{user.address || '-'}</p>
                        </td>
                        <td className="px-4 py-4">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleActive(user._id)}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-all hover:scale-105 ${
                              user.isActive ? 'text-emerald-600' : 'text-slate-400'
                            }`}
                          >
                            {user.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                            <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

