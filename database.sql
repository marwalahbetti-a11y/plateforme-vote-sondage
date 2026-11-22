-- =====================================================
-- Base de données : Plateforme de vote et sondage
-- =====================================================

CREATE DATABASE IF NOT EXISTS vote_sondage
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vote_sondage;

-- -----------------------------------------------------
-- Table users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Table polls
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS polls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  created_by INT NOT NULL,
  creation_mode ENUM('manual', 'ai') NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME NOT NULL,
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table poll_options
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS poll_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table votes
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  poll_id INT NOT NULL,
  user_id INT NOT NULL,
  option_id INT NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (poll_id, user_id),
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE
);