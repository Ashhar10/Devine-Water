require('dotenv').config();
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { prisma, connectDB } = require('./config/db');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (prompt) => {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
};

const createFirstAdmin = async () => {
    await connectDB();

    console.log('\n🔧 Water Management System - First Time Setup\n');
    console.log('This script will create your first admin user.\n');

    // Check if any users exist
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
        console.log('⚠️  Users already exist in the database!');
        const confirm = await question('Do you want to create another admin anyway? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
            console.log('❌ Setup cancelled.');
            await prisma.$disconnect();
            rl.close();
            process.exit(0);
        }
    }

    // Get admin details
    const username = await question('Enter admin username: ');
    const password = await question('Enter admin password: ');
    const fullName = await question('Enter full name: ');
    const email = await question('Enter email: ');
    const phone = await question('Enter phone number: ');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    try {
        const admin = await prisma.user.create({
            data: {
                username: username.trim(),
                email: email.trim(),
                password: hashedPassword,
                role: 'admin',
                fullName: fullName.trim(),
                phone: phone.trim(),
                address: 'Head Office'
            }
        });

        console.log('\n✅ Admin user created successfully!');
        console.log(`\n📝 Login with:`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Password: ${password}`);
        console.log(`\n🚀 You can now start the server with: npm start`);
        console.log(`   Visit: http://localhost:5173\n`);

    } catch (error) {
        if (error.code === 'P2002') {
            console.error('\n❌ Error: Username or email already exists!');
        } else {
            console.error('\n❌ Error creating admin:', error.message);
        }
    }

    await prisma.$disconnect();
    rl.close();
    process.exit(0);
};

createFirstAdmin().catch((error) => {
    console.error('❌ Setup error:', error);
    rl.close();
    process.exit(1);
});
