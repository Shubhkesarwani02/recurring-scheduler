import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("exceptions").del();
    await knex("slots").del();

    // Insert sample recurring slots
    await knex("slots").insert([
        {
            day_of_week: 1, // Monday
            start_time: "09:00",
            end_time: "10:00"
        },
        {
            day_of_week: 1, // Monday
            start_time: "14:00",
            end_time: "15:30"
        },
        {
            day_of_week: 3, // Wednesday
            start_time: "10:00",
            end_time: "11:30"
        },
        {
            day_of_week: 5, // Friday
            start_time: "16:00",
            end_time: "17:00"
        }
    ]);
}