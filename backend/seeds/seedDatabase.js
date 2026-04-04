// Seed database with demo drivers and policies
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '../scudo.db');
const db = new sqlite3.Database(DB_PATH);

const demoDrivers = [
  {
    name: 'Rajesh Kumar',
    phone: '9876543210',
    city: 'Mumbai',
    platform: 'Swiggy',
    vehicle_type: 'two-wheeler',
    avg_daily_earn: 1200,
    weekly_hours: 50,
    weekly_orders: 140,
    weekly_gmv: 6000
  },
  {
    name: 'Priya Sharma',
    phone: '9876543211',
    city: 'Delhi',
    platform: 'Zomato',
    vehicle_type: 'two-wheeler',
    avg_daily_earn: 1100,
    weekly_hours: 48,
    weekly_orders: 135,
    weekly_gmv: 5500
  },
  {
    name: 'Akhil Reddy',
    phone: '9876543212',
    city: 'Hyderabad',
    platform: 'Swiggy',
    vehicle_type: 'two-wheeler',
    avg_daily_earn: 950,
    weekly_hours: 42,
    weekly_orders: 110,
    weekly_gmv: 4800
  },
  {
    name: 'Maya Patel',
    phone: '9876543213',
    city: 'Bangalore',
    platform: 'Flipkart',
    vehicle_type: 'two-wheeler',
    avg_daily_earn: 1050,
    weekly_hours: 45,
    weekly_orders: 120,
    weekly_gmv: 5200
  },
  {
    name: 'Suresh Andhra',
    phone: '9876543214',
    city: 'Chennai',
    platform: 'Dunzo',
    vehicle_type: 'two-wheeler',
    avg_daily_earn: 900,
    weekly_hours: 40,
    weekly_orders: 105,
    weekly_gmv: 4500
  }
];

const seedDatabase = () => {
  db.serialize(() => {
    demoDrivers.forEach(driver => {
      const driver_id = uuidv4();
      const registration_date = new Date().toISOString();
      const enrollment_date = new Date().toISOString();

      db.run(
        `INSERT INTO drivers (id, phone, name, city, platform, vehicle_type, avg_daily_earn, weekly_hours, weekly_orders, weekly_gmv, registration_date, enrollment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [driver_id, driver.phone, driver.name, driver.city, driver.platform, driver.vehicle_type, driver.avg_daily_earn, driver.weekly_hours, driver.weekly_orders, driver.weekly_gmv, registration_date, enrollment_date],
        (err) => {
          if (!err) {
            console.log(`✓ Added driver: ${driver.name}`);
          }
        }
      );
    });

    setTimeout(() => {
      console.log('\n✓ Database seeded successfully!');
      process.exit(0);
    }, 1000);
  });
};

seedDatabase();
