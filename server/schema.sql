DROP TABLE IF EXISTS curls;

CREATE TABLE curls (
    -- Internal ID of the curl
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- The date when the curl was created
    created TIMESTAMP NOT NULL,

    -- The date when the curl was last changed
    updated TIMESTAMP NOT NULL,

    -- The public name of the curl
    curl TEXT NOT NULL UNIQUE,

    -- The secret key of the curl
    key TEXT NOT NULL,

    -- The current text of the curl
    status TEXT NOT NULL,

    -- The total number of changes made
    changes INTEGER NOT NULL DEFAULT 0
);