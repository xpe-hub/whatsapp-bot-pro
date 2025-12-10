import sqlite3 from 'sqlite3';

interface User {
    jid: string;
    name?: string;
    isAdmin?: boolean;
    isBanned?: boolean;
    createdAt?: string;
}

interface Group {
    jid: string;
    name?: string;
    isActive?: boolean;
    createdAt?: string;
}

interface Message {
    fromJid: string;
    toJid: string;
    content?: string;
    timestamp?: string;
    messageId?: string;
}

class SQLiteDatabase {
    private db: sqlite3.Database | null = null;

    async connect(databasePath: string = './bot.db'): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(databasePath, (err) => {
                if (err) {
                    console.error('❌ Database connection failed:', err);
                    reject(err);
                } else {
                    console.log('✅ Database connected successfully');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            const queries = [
                // Users table
                `CREATE TABLE IF NOT EXISTS users (
                    jid TEXT PRIMARY KEY,
                    name TEXT,
                    isAdmin BOOLEAN DEFAULT FALSE,
                    isBanned BOOLEAN DEFAULT FALSE,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                
                // Groups table
                `CREATE TABLE IF NOT EXISTS groups (
                    jid TEXT PRIMARY KEY,
                    name TEXT,
                    isActive BOOLEAN DEFAULT TRUE,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                
                // Messages table
                `CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fromJid TEXT NOT NULL,
                    toJid TEXT NOT NULL,
                    content TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    messageId TEXT
                )`,
                
                // Settings table
                `CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )`
            ];

            let completed = 0;
            queries.forEach((query) => {
                this.db!.run(query, (err) => {
                    if (err) {
                        console.error('❌ Table creation failed:', err);
                        reject(err);
                    } else {
                        completed++;
                        if (completed === queries.length) {
                            console.log('✅ Database tables created successfully');
                            resolve();
                        }
                    }
                });
            });
        });
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.db = null;
                        console.log('🔌 Database disconnected');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    async getUser(jid: string): Promise<User | null> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            this.db!.get('SELECT * FROM users WHERE jid = ?', [jid], (err, row: User | undefined) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    async saveUser(jid: string, name?: string): Promise<void> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            this.db!.run(
                'INSERT OR REPLACE INTO users (jid, name) VALUES (?, ?)',
                [jid, name],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async getGroup(jid: string): Promise<Group | null> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            this.db!.get('SELECT * FROM groups WHERE jid = ?', [jid], (err, row: Group | undefined) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    async saveGroup(jid: string, name?: string): Promise<void> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            this.db!.run(
                'INSERT OR REPLACE INTO groups (jid, name) VALUES (?, ?)',
                [jid, name],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async saveMessage(fromJid: string, toJid: string, content?: string, messageId?: string): Promise<void> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            this.db!.run(
                'INSERT INTO messages (fromJid, toJid, content, messageId) VALUES (?, ?, ?, ?)',
                [fromJid, toJid, content, messageId],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    async getSetting(key: string): Promise<string | null> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            this.db!.get('SELECT value FROM settings WHERE key = ?', [key], (err, row: { value?: string } | undefined) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row?.value || null);
                }
            });
        });
    }

    async setSetting(key: string, value: string): Promise<void> {
        if (!this.db) throw new Error('Database not connected');

        return new Promise((resolve, reject) => {
            this.db!.run(
                'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
                [key, value],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
}

export default new SQLiteDatabase();