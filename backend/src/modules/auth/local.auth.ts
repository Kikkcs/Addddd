import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// SMTP Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS || '',
    }
});

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

    // Provisions a new sub-account user & dispatches an Email Invitation with password setup link
    server.post('/api/auth/register', async (request, reply) => {
        try {
            const { email, name, role } = request.body as any;

            if (!email) {
                return reply.status(400).send({ success: false, message: 'Email address is required' });
            }

            const exists = await prisma.user.findUnique({ where: { email } });
            if (exists) {
                // Re-generate invitation token for existing user
                const inviteToken = jwt.sign(
                    { email: exists.email, name: exists.name, role: exists.role, type: 'INVITE' },
                    process.env.JWT_SECRET || 'fallback_secret',
                    { expiresIn: '7d' }
                );

                const origin = request.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
                const setupLink = `${origin}/?inviteToken=${encodeURIComponent(inviteToken)}`;

                return reply.send({
                    success: true,
                    user: exists,
                    inviteLink: setupLink,
                    message: `User is already in directory. Generated a fresh password setup link!`
                });
            }

            // Create Invitation Token valid for 7 days
            const inviteToken = jwt.sign(
                { email, name, role: role || 'Support', type: 'INVITE' },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '7d' }
            );

            // Determine frontend base URL dynamically from request header or env
            const origin = request.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
            const setupLink = `${origin}/?inviteToken=${encodeURIComponent(inviteToken)}`;

            // Dispatch email in background so endpoint returns instantly
            const mailOptions = {
                from: process.env.EMAIL_FROM || '"Adeaur Operations" <updates@adeaur.com>',
                to: email,
                subject: 'Invitation to Join Adeaur Operations - Set Up Your Account',
                html: `
                    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #0f172a;">You are invited to join Adeaur Operations</h2>
                        <p style="color: #475569;">You have been assigned the <strong>${role || 'Support'}</strong> role.</p>
                        <p style="color: #475569;">Please click the button below to set up your account password of your own choice:</p>
                        <a href="${setupLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Set Up Your Password</a>
                        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Link valid for 7 days. If you did not expect this invitation, please ignore this email.</p>
                    </div>
                `
            };

            // Construct live transporter using active process.env
            const activeTransporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_PORT === '465',
                auth: (process.env.SMTP_USER || process.env.SMTP_PASS) ? {
                    user: process.env.SMTP_USER || 'apikey',
                    pass: process.env.SMTP_PASS || '',
                } : undefined
            });

            activeTransporter.sendMail(mailOptions)
                .then(info => console.log('[Invite Email Dispatch SUCCESS] Sent to:', email, 'MessageID:', info.messageId))
                .catch(err => console.error('[Invite Email Dispatch ERROR] Failed for:', email, 'Error:', err.message));

            // Create temporary pending user record in DB with unguessable placeholder password
            const tempHashedPassword = await bcrypt.hash('INVITED_PENDING_' + Math.random(), 10);
            const newUser = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    role: role || 'Support',
                    password: tempHashedPassword
                }
            });

            const { password: _p, ...safeUser } = newUser;
            return reply.send({
                success: true,
                user: safeUser,
                inviteLink: setupLink,
                message: `Invitation email sent to ${email} with custom password setup link.`
            });

        } catch (e) {
            server.log.error(e as Error, 'Register error');
            return reply.status(500).send({ success: false, message: 'Internal server error' });
        }
    });

    // Verifies an invitation token
    server.get('/api/auth/verify-invite', async (request, reply) => {
        try {
            const { token } = request.query as any;
            if (!token) {
                return reply.status(400).send({ success: false, message: 'Token missing' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

            if (decoded.type !== 'INVITE') {
                return reply.status(400).send({ success: false, message: 'Invalid token type' });
            }

            return reply.send({
                success: true,
                email: decoded.email,
                role: decoded.role,
                name: decoded.name
            });

        } catch (e) {
            return reply.status(400).send({ success: false, message: 'Invitation link expired or invalid.' });
        }
    });

    // Submits the user's chosen password and activates their account
    server.post('/api/auth/setup-password', async (request, reply) => {
        try {
            const { token, password } = request.body as any;

            if (!token || !password || password.length < 6) {
                return reply.status(400).send({ success: false, message: 'Valid token and password (min 6 chars) required' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

            if (decoded.type !== 'INVITE') {
                return reply.status(400).send({ success: false, message: 'Invalid token type' });
            }

            // Hash the password chosen by the user
            const hashedPassword = await bcrypt.hash(password, 10);

            // Upsert / update user password in Prisma DB
            const updatedUser = await prisma.user.upsert({
                where: { email: decoded.email },
                update: {
                    password: hashedPassword,
                    role: decoded.role,
                },
                create: {
                    email: decoded.email,
                    name: decoded.name || decoded.email.split('@')[0],
                    role: decoded.role || 'Support',
                    password: hashedPassword,
                }
            });

            // Generate login token for immediate access
            const authToken = jwt.sign(
                { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            const { password: _p, ...safeUser } = updatedUser;
            return reply.send({ success: true, token: authToken, user: safeUser });

        } catch (e) {
            server.log.error(e as Error, 'Setup password error');
            return reply.status(400).send({ success: false, message: 'Expired or invalid link. Please ask admin for a new invite.' });
        }
    });
};

