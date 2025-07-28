#!/usr/bin/env tsx

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

console.log('🚀 Setting up database...')

// Check if .env file exists
const envPath = join(process.cwd(), '.env')
if (!existsSync(envPath)) {
    console.error('❌ .env file not found!')
    console.log('📝 Please create a .env file with your database connection string:')
    console.log('   DATABASE_URL="postgresql://username:password@host:port/database"')
    console.log('')
    console.log('💡 You can copy from env.example:')
    console.log('   cp env.example .env')
    process.exit(1)
}

try {
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    // Push schema to database
    console.log('📊 Pushing schema to database...')
    execSync('npx prisma db push', { stdio: 'inherit' })

    // Seed the database
    console.log('🌱 Seeding database...')
    execSync('npm run db:seed', { stdio: 'inherit' })

    console.log('✅ Database setup completed successfully!')
    console.log('')
    console.log('🎉 You can now start the development server:')
    console.log('   npm run dev')
    console.log('')
    console.log('📖 Open http://localhost:3000 to view your application')

} catch (error) {
    console.error('❌ Error during database setup:', error)
    process.exit(1)
} 