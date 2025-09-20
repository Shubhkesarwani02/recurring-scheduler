#!/usr/bin/env node

/**
 * Setup script for Recurring Scheduler Backend
 * This script will:
 * 1. Install dependencies
 * 2. Run database migrations
 * 3. Seed the database with sample data
 * 4. Start the development server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Recurring Scheduler Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating from .env.example...');
  if (fs.existsSync(path.join(__dirname, '.env.example'))) {
    fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
    console.log('📝 Please update the .env file with your database credentials.\n');
  }
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Run migrations
  console.log('\n🗄️  Running database migrations...');
  execSync('npm run migrate', { stdio: 'inherit' });

  // Run seeds
  console.log('\n🌱 Seeding database with sample data...');
  execSync('npm run seed', { stdio: 'inherit' });

  console.log('\n✅ Setup complete! You can now run:');
  console.log('   npm run dev    - Start development server');
  console.log('   npm run build  - Build for production');
  console.log('   npm start      - Start production server');

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  console.log('\n💡 Manual setup instructions:');
  console.log('1. Update your .env file with correct database credentials');
  console.log('2. Run: npm install');
  console.log('3. Run: npm run migrate');
  console.log('4. Run: npm run seed');
  console.log('5. Run: npm run dev');
  process.exit(1);
}