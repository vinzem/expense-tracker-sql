CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS expenses (
    expense_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_id  INT NOT NULL,
    amount       DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description  VARCHAR(255),
    expense_date DATE NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

INSERT IGNORE INTO categories (name) VALUES
    ('Food'), ('Transport'), ('School'), ('Bills'), ('Entertainment'), ('Other');
