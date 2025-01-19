-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- API KEYS TABLE
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);


-- LEADS TABLE
CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    user_id INTEGER NOT NULL, 
    name TEXT NOT NULL, -- Lead's name
    phone TEXT, -- Lead's phone
    email TEXT NOT NULL, -- Email address
    message TEXT, -- Lead's message
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Creation date
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Update date
    FOREIGN KEY (user_id) REFERENCES users (id)
);