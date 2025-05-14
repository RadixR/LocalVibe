const mongoose        = require('mongoose');
const bcrypt          = require('bcrypt');
require('dotenv').config();

const User            = require('./models/User');
const Event           = require('./models/Event');
const EventEdit       = require('./models/EventEdit');
const Notification    = require('./models/Notification');
const ModerationLog   = require('./models/ModerationLog');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected for seeding...');

    
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      EventEdit.deleteMany({}),
      Notification.deleteMany({}),
      ModerationLog.deleteMany({})
    ]);
    console.log('Data cleared.');

    console.log('Creating users...');
    const saltRounds = 10;
    const [adminUser, testUser1, testUser2] = await Promise.all([
      User.create({
        firstName: 'Admin',
        lastName: 'LocalVibe',
        email: 'admin@localvibe.com',
        hashedPassword: await bcrypt.hash('adminpass', saltRounds),
        isAdmin: true,
        notificationPreferences: { emailAlerts: true, appAlerts: true }
      }),
      User.create({
        firstName: 'Alice',
        lastName: 'Wonder',
        email: 'alice@example.com',
        hashedPassword: await bcrypt.hash('alicepass', saltRounds),
        notificationPreferences: { emailAlerts: true, appAlerts: true }
      }),
      User.create({
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@example.com',
        hashedPassword: await bcrypt.hash('bobpass', saltRounds),
        notificationPreferences: { emailAlerts: true, appAlerts: true }
      })
    ]);
    console.log(`Created ${[adminUser, testUser1, testUser2].length} users.`);

    console.log('Creating events...');
    const eventsData = [
      {
        title: 'Hoboken Food Truck Fest',
        description: 'A variety of food trucks by the waterfront.',
        address: 'Pier A Park, Hoboken, NJ', 
        formattedAddress: 'Pier A Park, 100 Sinatra Dr, Hoboken, NJ 07030, USA', 
        latitude: 40.7360,
        longitude: -74.0270,
        placeId: 'ChIJ0XW2P7VZwokR5hM3bT2uSNw', 
        eventDate: new Date(new Date().setDate(new Date().getDate() + 14)), 
        startTime: '12:00',
        endTime: '18:00',
        capacity: 200,
        category: 'Food',
        tags: ['food truck', 'hoboken', 'outdoor'],
        creatorID: testUser1._id,
        status: 'approved'
      },
      {
        title: 'Manhattan Rooftop Movie Night',
        description: 'Classic movie screening with city views.',
        address: '230 Fifth Rooftop Bar, New York, NY',
        formattedAddress: '230 5th Ave, New York, NY 10001, USA',
        latitude: 40.7445,
        longitude: -73.9883,
        placeId: 'ChIJ_______XYZ', 
        eventDate: new Date(new Date().setDate(new Date().getDate() + 21)), 
        startTime: '20:00',
        endTime: '23:00',
        capacity: 100,
        category: 'Arts',
        tags: ['movie', 'rooftop', 'manhattan'],
        creatorID: testUser2._id,
        status: 'approved'
      },
      {
        title: 'Central Park Morning Yoga',
        description: 'Relaxing yoga session in the park. Bring your own mat!',
        address: 'Sheep Meadow, Central Park, New York, NY',
        formattedAddress: 'Sheep Meadow, Central Park, New York, NY, USA',
        latitude: 40.7716,
        longitude: -73.9737,
        placeId: 'ChIJ_______ABC', 
        eventDate: new Date(new Date().setDate(new Date().getDate() + 7)), 
        startTime: '08:00',
        endTime: '09:00',
        capacity: 50,
        category: 'Sports', 
        tags: ['yoga', 'central park', 'wellness'],
        creatorID: testUser1._id,
        status: 'pending' 
      },
      {
        title: 'Hoboken Tech Meetup',
        description: 'Networking and talks on new tech trends.',
        address: 'W Hoboken, Hoboken, NJ',
        formattedAddress: 'W Hoboken, 225 River St, Hoboken, NJ 07030, USA',
        latitude: 40.7391,
        longitude: -74.0277,
        placeId: 'ChIJ_______EFG', 
        eventDate: new Date(new Date().setDate(new Date().getDate() + 30)), 
        startTime: '18:30',
        endTime: '21:00',
        capacity: 75,
        category: 'Technology',
        tags: ['tech', 'meetup', 'networking'],
        creatorID: adminUser._id, 
        status: 'approved'
      },
      {
        title: 'Gallery Opening in Chelsea',
        description: 'New exhibition by a local artist.',
        address: 'Gagosian Gallery, Chelsea, NYC', 
        formattedAddress: 'Gagosian, 555 W 24th St, New York, NY 10011, USA', 
        latitude: 40.7486,
        longitude: -74.0037,
        placeId: 'ChIJ_______HIJ', 
        eventDate: new Date(new Date().setDate(new Date().getDate() + 10)), 
        startTime: '19:00',
        endTime: '22:00',
        capacity: 120,
        category: 'Arts',
        tags: ['art', 'gallery', 'chelsea', 'exhibition'],
        creatorID: testUser2._id,
        status: 'rejected' 
      },
      {
        title: 'Stevens Tech Innovation Showcase',
        description: 'Showcasing new tech projects.',
        address: 'Stevens Institute of Technology, Hoboken, NJ',
        formattedAddress: 'Stevens Institute of Technology, 1 Castle Point Ter, Hoboken, NJ 07030, USA',
        latitude: 40.7444,
        longitude: -74.0244,
        placeId: 'ChIJ_______KLM', 
        eventDate: new Date(new Date().setDate(new Date().getDate() + 14)), 
        startTime: '10:00',
        endTime: '16:00',
        capacity: 200,
        category: 'Technology',
        tags: ['tech', 'innovation', 'stevens', 'showcase'],
        creatorID: adminUser._id, 
      }
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`Created ${createdEvents.length} events.`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding process:', err);
    process.exit(1);
  }
})(); 