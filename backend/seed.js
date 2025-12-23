require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Order = require('./models/Order');
const FinanceIncoming = require('./models/FinanceIncoming');
const FinanceOutgoing = require('./models/FinanceOutgoing');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Order.deleteMany({});
    await FinanceIncoming.deleteMany({});
    await FinanceOutgoing.deleteMany({});

    // Create users
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
        username: 'admin',
        email: 'admin@water.com',
        password: hashedPassword,
        role: 'admin',
        fullName: 'Admin User',
        phone: '1234567890',
        address: 'Admin Office'
    });

    const customer = await User.create({
        username: 'customer',
        email: 'customer@example.com',
        password: hashedPassword,
        role: 'customer',
        fullName: 'John Customer',
        phone: '9876543210',
        address: '123 Main St'
    });

    const supplier = await User.create({
        username: 'supplier',
        email: 'supplier@example.com',
        password: hashedPassword,
        role: 'supplier',
        fullName: 'Mike Supplier',
        phone: '5555555555',
        address: 'Warehouse District'
    });

    const shopkeeper = await User.create({
        username: 'shopkeeper',
        email: 'shop@example.com',
        password: hashedPassword,
        role: 'shopkeeper',
        fullName: 'Sarah Shopkeeper',
        phone: '7777777777',
        address: 'Shop 1'
    });

    // Create sample orders
    await Order.create({
        customerId: customer._id,
        quantity: 5,
        deliveryDate: new Date(Date.now() + 86400000), // Tomorrow
        address: customer.address,
        status: 'pending'
    });

    await Order.create({
        customerId: customer._id,
        quantity: 3,
        deliveryDate: new Date(Date.now() + 172800000), // Day after tomorrow
        address: customer.address,
        status: 'assigned',
        supplierId: supplier._id
    });

    // Create sample finance records
    await FinanceIncoming.create({
        source: 'customer_payment',
        amount: 500,
        customerId: customer._id,
        description: 'Monthly payment',
        paymentMethod: 'cash'
    });

    await FinanceOutgoing.create({
        category: 'electricity',
        amount: 1500,
        description: 'Monthly electricity bill'
    });

    await FinanceOutgoing.create({
        category: 'maintenance',
        amount: 800,
        description: 'Equipment maintenance'
    });

    console.log('✅ Database seeded successfully!');
    console.log('\\n📝 Demo Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Customer: customer / admin123');
    console.log('Supplier: supplier / admin123');
    console.log('Shopkeeper: shopkeeper / admin123');

    process.exit(0);
};

seedDatabase();
