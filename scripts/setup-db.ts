import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

async function setupDatabase() {
  try {
    console.log("[v0] Creating users table...")
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("[v0] Creating detections table...")
    await sql`
      CREATE TABLE IF NOT EXISTS detections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plant_name VARCHAR(255),
        is_plant BOOLEAN NOT NULL,
        confidence FLOAT NOT NULL,
        latitude FLOAT,
        longitude FLOAT,
        address VARCHAR(500),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("[v0] Creating indexes...")
    await sql`CREATE INDEX IF NOT EXISTS idx_detections_user_id ON detections(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at)`

    console.log("[v0] Inserting demo user...")
    await sql`
      INSERT INTO users (email, password, name) 
      VALUES ('demo@example.com', 'demo123', 'Demo User')
      ON CONFLICT (email) DO NOTHING
    `

    console.log("[v0] Database setup completed successfully!")
  } catch (error) {
    console.error("[v0] Database setup error:", error)
    process.exit(1)
  }
}

setupDatabase()
