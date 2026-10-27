import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { memoryStore } from './memoryStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'devtrack_super_secret_jwt_key_2026';

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const authService = {
  async register({ name, email, password, role = 'developer', team = 'Core Engineering', bio = '' }) {
    if (!name || name.trim().length < 2) {
      const err = new Error('Name must be at least 2 characters long');
      err.status = 400;
      throw err;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      const err = new Error('Please enter a valid email address');
      err.status = 400;
      throw err;
    }

    if (!password || password.length < 6) {
      const err = new Error('Password must be at least 6 characters long');
      err.status = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isMongoConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        const err = new Error('An account with this email address already exists');
        err.status = 409;
        throw err;
      }

      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;

      const user = new User({
        name: name.trim(),
        email: cleanEmail,
        password,
        role,
        team: team.trim(),
        bio: bio.trim(),
        avatar,
      });

      await user.save();
      const token = generateToken(user);
      return { user: user.toJSON(), token };
    } else {
      // Memory Store Fallback
      const existing = memoryStore.findUserByEmail(cleanEmail);
      if (existing) {
        const err = new Error('An account with this email address already exists');
        err.status = 409;
        throw err;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;

      const user = memoryStore.createUser({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role,
        team: team.trim(),
        bio: bio.trim(),
        avatar,
      });

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    }
  },

  async login({ email, password }) {
    if (!email || !password) {
      const err = new Error('Please provide both email and password');
      err.status = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isMongoConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
      }

      const token = generateToken(user);
      return { user: user.toJSON(), token };
    } else {
      // Memory store fallback
      const user = memoryStore.findUserByEmail(cleanEmail);
      if (!user) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        throw err;
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    }
  },

  async getCurrentUser(userId, email = null) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(userId)
        ? { _id: userId }
        : { $or: [{ email: email || userId }, { name: userId }] };
      const user = await User.findOne(query);
      if (user) {
        return user.toJSON();
      }
    }
    const user = memoryStore.findUserById(userId) || (email ? memoryStore.findUserByEmail(email) : null);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async listUsers() {
    if (isMongoConnected()) {
      const users = await User.find().select('-password').sort({ name: 1 });
      return users;
    } else {
      return memoryStore.users.map(({ password: _, ...u }) => u);
    }
  },

  async updateTheme(userId, theme, email = null) {
    if (!theme) {
      const err = new Error('Theme is required');
      err.status = 400;
      throw err;
    }

    const cleanTheme = String(theme).trim();

    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(userId)
        ? { _id: userId }
        : { $or: [{ email: email || userId }, { name: userId }] };

      const user = await User.findOneAndUpdate(
        query,
        { $set: { theme: cleanTheme } },
        { new: true }
      );
      if (user) {
        memoryStore.updateUser(user.email, { theme: cleanTheme });
        return user.toJSON();
      }
    }

    const user = memoryStore.updateUser(userId, { theme: cleanTheme }) ||
                 (email ? memoryStore.updateUser(email, { theme: cleanTheme }) : null);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
