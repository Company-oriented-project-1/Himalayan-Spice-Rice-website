const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
	__internal: {
		engine: {
			type: 'library'
		}
	}
});

const USER_SAFE_SELECT = {
	id: true,
	email: true,
	name: true,
	role: true,
	isVerified: true,
	createdAt: true,
	updatedAt: true
};

const parseBoolean = (value) => {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		if (value.toLowerCase() === 'true') return true;
		if (value.toLowerCase() === 'false') return false;
	}
	return undefined;
};

const pickUpdateFields = async (body) => {
	const data = {};

	if (body.name !== undefined) data.name = body.name;
	if (body.email !== undefined) data.email = body.email;
	if (body.role !== undefined) data.role = body.role;
	if (body.isVerified !== undefined) data.isVerified = body.isVerified;

	if (body.password !== undefined) {
		if (!body.password || String(body.password).trim().length < 6) {
			throw new Error('Password must be at least 6 characters');
		}
		data.password = await bcrypt.hash(String(body.password), 10);
	}

	return data;
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
	try {
		const { email, password, name, role, isVerified } = req.body;

		if (!email || !password || !name) {
			return res.status(400).json({ message: 'Email, password, and name are required' });
		}

		if (String(name).trim().length < 2) {
			return res.status(400).json({ message: 'Name must be at least 2 characters long' });
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
			return res.status(400).json({ message: 'Invalid email format' });
		}

		if (String(password).length < 6) {
			return res.status(400).json({ message: 'Password must be at least 6 characters long' });
		}

		const finalRole = role && ['ADMIN', 'CUSTOMER'].includes(role) ? role : 'CUSTOMER';
		const finalVerified = typeof isVerified === 'boolean' ? isVerified : false;

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(String(password), 10);

		const newUser = await prisma.user.create({
			data: {
				email: String(email).trim(),
				password: hashedPassword,
				name: String(name).trim(),
				role: finalRole,
				isVerified: finalVerified,
				verificationToken: finalVerified ? null : undefined
			},
			select: USER_SAFE_SELECT
		});

		res.status(201).json({ message: 'User created successfully', user: newUser });
	} catch (err) {
		if (err.code === 'P2002') {
			return res.status(400).json({ message: 'Email already in use' });
		}

		res.status(500).json({ message: 'Failed to create user', error: err.message });
	}
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page || '1', 10), 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
		const skip = (page - 1) * limit;

		const role = req.query.role;
		const search = req.query.search;
		const isVerified = parseBoolean(req.query.isVerified);

		const where = {};

		if (role) {
			where.role = role;
		}

		if (typeof isVerified === 'boolean') {
			where.isVerified = isVerified;
		}

		if (search && String(search).trim()) {
			where.OR = [
				{ email: { contains: String(search), mode: 'insensitive' } },
				{ name: { contains: String(search), mode: 'insensitive' } }
			];
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
				select: USER_SAFE_SELECT
			}),
			prisma.user.count({ where })
		]);

		res.status(200).json({
			users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch users', error: err.message });
	}
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await prisma.user.findUnique({
			where: { id },
			select: USER_SAFE_SELECT
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch user', error: err.message });
	}
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
	try {
		const { id } = req.params;

		const existingUser = await prisma.user.findUnique({ where: { id } });
		if (!existingUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		const updateData = await pickUpdateFields(req.body);
		if (Object.keys(updateData).length === 0) {
			return res.status(400).json({ message: 'No valid fields provided for update' });
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			select: USER_SAFE_SELECT
		});

		res.status(200).json({ message: 'User updated successfully', user: updatedUser });
	} catch (err) {
		if (err.code === 'P2002') {
			return res.status(400).json({ message: 'Email already in use' });
		}

		if (err.message === 'Password must be at least 6 characters') {
			return res.status(400).json({ message: err.message });
		}

		res.status(500).json({ message: 'Failed to update user', error: err.message });
	}
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
	try {
		const { id } = req.params;
		const { role } = req.body;

		if (!role || !['ADMIN', 'CUSTOMER'].includes(role)) {
			return res.status(400).json({ message: 'Role must be ADMIN or CUSTOMER' });
		}

		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: { role },
			select: USER_SAFE_SELECT
		});

		res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
	} catch (err) {
		res.status(500).json({ message: 'Failed to update user role', error: err.message });
	}
};

// PATCH /api/admin/users/:id/verify
exports.setUserVerification = async (req, res) => {
	try {
		const { id } = req.params;
		const verified = parseBoolean(req.body.isVerified);

		if (typeof verified !== 'boolean') {
			return res.status(400).json({ message: 'isVerified must be true or false' });
		}

		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				isVerified: verified,
				verificationToken: verified ? null : user.verificationToken
			},
			select: USER_SAFE_SELECT
		});

		res.status(200).json({ message: 'User verification updated successfully', user: updatedUser });
	} catch (err) {
		res.status(500).json({ message: 'Failed to update verification state', error: err.message });
	}
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
	try {
		const { id } = req.params;

		if (req.user.id === id) {
			return res.status(400).json({ message: 'Admin cannot delete their own account' });
		}

		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		await prisma.user.delete({ where: { id } });

		res.status(200).json({ message: 'User deleted successfully' });
	} catch (err) {
		res.status(500).json({ message: 'Failed to delete user', error: err.message });
	}
};

// GET /api/admin/users/stats/summary
exports.getUserStats = async (_req, res) => {
	try {
		const [totalUsers, totalAdmins, totalCustomers, verifiedUsers, unverifiedUsers] = await Promise.all([
			prisma.user.count(),
			prisma.user.count({ where: { role: 'ADMIN' } }),
			prisma.user.count({ where: { role: 'CUSTOMER' } }),
			prisma.user.count({ where: { isVerified: true } }),
			prisma.user.count({ where: { isVerified: false } })
		]);

		res.status(200).json({
			totalUsers,
			totalAdmins,
			totalCustomers,
			verifiedUsers,
			unverifiedUsers
		});
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch user stats', error: err.message });
	}
};

// GET /api/admin/dashboard/details
exports.getDashboardDetails = async (_req, res) => {
	try {
		const totalUsers = await prisma.user.count();

		res.status(200).json({
			totalUsers,
			totalProducts: 0,
			totalOrders: 0,
			pendingOrders: 0,
			note: 'Product and order counts are placeholders until Product/Order schema is added.'
		});
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch dashboard details', error: err.message });
	}
};

