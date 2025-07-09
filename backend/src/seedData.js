const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
console.log('MONGODB_URI:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('Starting to seed data...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create mentor user
const mentor = await User.create({
  name: 'Ahmad Digital',
  email: 'ahmad.digital@example.com',
  password: 'mentor123',
  role: 'mentor'
});

    // Create sample students
    const students = await User.create([
      {
        name: 'Ahmad Student',
        email: 'ahmad@example.com',
        password: 'student123',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Sarah Learner',
        email: 'sarah@example.com',
        password: 'student123',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Budi Digital',
        email: 'budi@example.com',
        password: 'student123',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Diana Marketing',
        email: 'diana@example.com',
        password: 'student123',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    ]);

    console.log('Data seeded successfully!');
    console.log(`Created ${students.length} students`);
    console.log('Admin credentials: admin@example.com / admin123');
    console.log('Mentor credentials: ahmad.digital@example.com / mentor123');
    console.log('Student credentials: ahmad@example.com / student123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData(); 