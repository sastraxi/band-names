import { DataSource } from "typeorm"
import { config } from "dotenv"

config()

export default new DataSource({
    type: "postgres", // or your database type
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["src/entities/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
})
