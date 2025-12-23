require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma, connectDB } = require('./config/db');

const seedDatabase = async () => {
    await connectDB();

    console.log('🗑️  Clearing existing data...');

    // Delete in correct order (children first, then parents)
    await prisma.activityLog.deleteMany({});
    await prisma.shopSale.deleteMany({});
    await prisma.routeCustomer.deleteMany({});
    await prisma.route.deleteMany({});
    await prisma.delivery.deleteMany({});
    await prisma.financeOutgoing.deleteMany({});
    await prisma.financeIncoming.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('👤 Creating users...');

    // Create users
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@water.com',
            password: hashedPassword,
            role: 'admin',
            fullName: 'Admin User',
            phone: '1234567890',
            address: 'Admin Office'
        }
    });

    const customer = await prisma.user.create({
        data: {
            username: 'customer',
            email: 'customer@example.com',
            password: hashedPassword,
            role: 'customer',
            fullName: 'John Customer',
            phone: '9876543210',
            address: '123 Main St'
        }
    });

    const supplier = await prisma.user.create({
        data: {
            username: 'supplier',
            email: 'supplier@example.com',
            password: hashedPassword,
            role: 'supplier',
            fullName: 'Mike Supplier',
            phone: '5555555555',
            address: 'Warehouse District'
        }
    });

    const shopkeeper = await prisma.user.create({
        data: {
            username: 'shopkeeper',
            email: 'shop@example.com',
            password: hashedPassword,
            role: 'shopkeeper',
            fullName: 'Sarah Shopkeeper',
            phone: '7777777777',
            address: 'Shop 1'
        }
    });

    console.log('📦 Creating sample orders...');

    // Create sample orders
    await prisma.order.create({
        data: {
            customerId: customer.id,
            quantity: 5,
            deliveryDate: new Date(Date.now() + 86400000), // Tomorrow
            address: customer.address,
            status: 'pending'
        }
    });

    await prisma.order.create({
        data: {
            customerId: customer.id,
            quantity: 3,
            deliveryDate: new Date(Date.now() + 172800000), // Day after tomorrow
            address: customer.address,
            status: 'assigned',
            supplierId: supplier.id
        }
    });

    console.log('💰 Creating finance records...');

    // Create sample finance records
    await prisma.financeIncoming.create({
        data: {
            source: 'customer_payment',
            amount: 500,
            customerId: customer.id,
            description: 'Monthly payment',
            paymentMethod: 'cash'
        }
    });

    await prisma.financeOutgoing.create({
        data: {
            category: 'electricity',
            amount: 1500,
            description: 'Monthly electricity bill'
        }
    });

    await prisma.financeOutgoing.create({
        data: {
            category: 'maintenance',
            amount: 800,
            description: 'Equipment maintenance'
        }
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Customer: customer / admin123');
    console.log('Supplier: supplier / admin123');
    console.log('Shopkeeper: shopkeeper / admin123');

    await prisma.$disconnect();
    process.exit(0);
};

seedDatabase().catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
});
