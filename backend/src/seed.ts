import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding root Admin user...');

    const email = 'admin@adeaur.com';
    const plainPassword = 'password123';

    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Upsert so running it twice doesn't crash
    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
        },
        create: {
            email,
            name: 'Adeaur Admin',
            role: 'ADMIN',
            password: hashedPassword,
        },
    });

    console.log('Admin user seeded securely!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${plainPassword}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
