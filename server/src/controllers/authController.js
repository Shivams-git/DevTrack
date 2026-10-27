import { authService } from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, team, bio } = req.body;
    const result = await authService.register({ name, email, password, role, team, bio });
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await authService.listUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTheme(req, res, next) {
  try {
    const { theme } = req.body;
    const user = await authService.updateTheme(req.user.id, theme);
    res.status(200).json({
      success: true,
      message: 'Theme preference saved',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
