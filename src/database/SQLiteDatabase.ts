import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export interface DatabaseConfig {
    database: string;
}

class SQLiteDatabase {
    private db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

    async connect(databasePath: string = './bot.db'): Promise<void> {
        this.db = await open({
            filename: databasePath,
            driver: sqlite3.Database
        });

        // Create tables if they don't exist
        await this.createTables();
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not connected');

        // Users table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                jid TEXT UNIQUE NOT NULL,
                name TEXT,
                isAdmin BOOLEAN DEFAULT FALSE,
                isBanned BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Groups table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                jid TEXT UNIQUE NOT NULL,
                name TEXT,
                isActive BOOLEAN DEFAULT TRUE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Messages table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fromJid TEXT NOT NULL,
                toJid TEXT NOT NULL,
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                messageId TEXT
            )
        `);

        // Settings table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables created successfully');
    }

    async disconnect(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }

    getDatabase(): Database<sqlite3.Database, sqlite3.Statement> | null {
        return this.db;
    }
}

export default new SQLiteDatabase();