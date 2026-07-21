import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const localAuthRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
    server.post('/api/auth/login', async (request, reply) => {
        try {
            const { email, password } = request.body as any;

            if (!email || !password) {
                return reply.status(400).send({ success: false, message: 'Email and password required' });
            }

            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return reply.status(401).send({ success: false, message: 'Invalid credentials' });
            }

            const pwdMatch = await bcrypt.compare(password, user.password);

            if (!pwdMatch) {
                return reply.status(401).send({ success: false, message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, name: user.name },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            // Never leak the hash back to the frontend
            const { password: _p, ...safeUser } = user;

            return reply.send({ success: true, token, user: safeUser });

        } catch (error) {
            server.log.error(error as Error, 'Login route error');
            return reply.status(500).send({ success: false, message: 'Internal Server Error' });
        }
    });

    // Validates a previously given JWT
    server.get('/api/auth/me', async (request, reply) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.status(401).send({ success: false, message: 'No token' });
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

            const user = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) {
                return reply.status(401).send({ success: false, message: 'User deleted' });
            }

            const { password: _p, ...safeUser } = user;
            return reply.send({ success: true, user: safeUser });

        } catch (e) {
            return reply.status(401).send({ success: false, message: 'Session expired' });
        }
    });

    // Fetches all workspace users
    server.get('/api/users', async (request, reply) => {
        try {
            const users = await prisma.user.findMany({
                select: { id: true, name: true, email: true, role: true }
            });
            // Map to frontend UserType structure
            const mappedUsers = users.map(u => ({
                id: u.id,
                name: u.name || 'Staff Member',
                email: u.email,
                role: u.role,
                status: 'Active',
                avatar: (u.name || u.email).substring(0, 2).toUpperCase()
            }));

            return reply.send({ success: true, data: mappedUsers });
        } catch (e) {
            server.log.error(e as Error, 'Fetch users error');
            return reply.status(500).send({ success: false, message: 'Internal error' });
        }
    });

    // Provisions a new sub-account user
    server.post('/api/auth/register', async (request, reply) => {
        try {
            const { email, name, role, password } = request.body as any;

            if (!email || !password) {
                return reply.status(400).send({ success: false, message: 'Email and password required' });
            }

            const exists = await prisma.user.findUnique({ where: { email } });
            if (exists) {
                return reply.status(400).send({ success: false, message: 'Email already mapped to an account' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.user.create({
                data: {
                    email,
                    name,
                    role: role || 'Support',
                    password: hashedPassword
                }
            });

            const { password: _p, ...safeUser } = newUser;
            return reply.send({ success: true, user: safeUser });

        } catch (e) {
            server.log.error(e as Error, 'Register error');
            return reply.status(500).send({ success: false, message: 'Internal error' });
        }
    });
};
