import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create slots table for recurring slots
  await knex.schema.createTable('slots', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.integer('day_of_week').notNullable() // 0 = Sunday, 1 = Monday, etc.
    table.string('start_time', 5).notNullable() // HH:MM format
    table.string('end_time', 5).notNullable() // HH:MM format
    table.timestamps(true, true)
    
    // Constraints
    table.check('?? >= 0 AND ?? <= 6', ['day_of_week', 'day_of_week'])
    table.check("?? ~ '^[0-2][0-9]:[0-5][0-9]$'", ['start_time'])
    table.check("?? ~ '^[0-2][0-9]:[0-5][0-9]$'", ['end_time'])
    
    // Unique constraint to prevent duplicate slots on same day and time
    table.unique(['day_of_week', 'start_time', 'end_time'])
    
    // Index for faster queries
    table.index(['day_of_week'])
  })

  // Create exceptions table for per-date modifications
  await knex.schema.createTable('exceptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('slot_id').references('id').inTable('slots').onDelete('CASCADE')
    table.date('date').notNullable() // YYYY-MM-DD format
    table.string('exception_type').notNullable() // 'updated' or 'deleted'
    table.string('start_time', 5).nullable() // Only for 'updated' type
    table.string('end_time', 5).nullable() // Only for 'updated' type
    table.timestamps(true, true)
    
    // Constraints
    table.check("?? IN ('updated', 'deleted')", ['exception_type'])
    table.check("(?? = 'deleted') OR (?? IS NOT NULL AND ?? IS NOT NULL)", 
                ['exception_type', 'start_time', 'end_time'])
    table.check("?? IS NULL OR ?? ~ '^[0-2][0-9]:[0-5][0-9]$'", ['start_time', 'start_time'])
    table.check("?? IS NULL OR ?? ~ '^[0-2][0-9]:[0-5][0-9]$'", ['end_time', 'end_time'])
    
    // Unique constraint to prevent multiple exceptions for same slot and date
    table.unique(['slot_id', 'date'])
    
    // Indexes for faster queries
    table.index(['slot_id'])
    table.index(['date'])
    table.index(['slot_id', 'date'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('exceptions')
  await knex.schema.dropTableIfExists('slots')
}