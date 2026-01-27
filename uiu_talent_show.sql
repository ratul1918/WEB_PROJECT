-- UIU Talent Showcase: database schema + seed data

DROP DATABASE IF EXISTS uiu_talent_show;
CREATE DATABASE uiu_talent_show CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uiu_talent_show;

-- USERS TABLE
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('viewer','creator','admin') NOT NULL DEFAULT 'viewer',
  student_id VARCHAR(50) NULL,
  avatar VARCHAR(255) NULL,
  bio TEXT NULL,
  social_links JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- POSTS TABLE
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('blog','video','audio') NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  duration VARCHAR(20) DEFAULT '0:00',
  thumbnail VARCHAR(255) NULL,
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- MEDIA TABLE
CREATE TABLE media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- POST VOTES
CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- USER VOTES (LEADERBOARD)
CREATE TABLE user_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  voter_id INT NOT NULL,
  candidate_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (voter_id, candidate_id),
  FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INDEXES
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_media_post_id ON media(post_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_user_votes_candidate_id ON user_votes(candidate_id);
CREATE INDEX idx_user_votes_voter_id ON user_votes(voter_id);

-- SEED USERS (PLAINTEXT PASSWORDS FOR DEV; LOGIN UPGRADES TO HASH)
INSERT INTO users (name, email, password, role) VALUES
('Viewer User', 'viewer@uiu.ac.bd', 'viewer123', 'viewer'),
('Creator User', 'creator@uiu.ac.bd', 'creator123', 'creator'),
('Admin User', 'admin@uiu.ac.bd', 'admin123', 'admin');

-- SEED POSTS (Link to existing uploads)
INSERT INTO posts (id, user_id, title, description, type, status, duration, views) VALUES
(1, 2, 'Cinematic City Landscape', 'A breathtaking view of the city skyline.', 'blog', 'approved', '0:00', 120),
(2, 2, 'Cyberpunk Vibes', 'Dark cyberpunk background music for your projects.', 'audio', 'approved', '3:45', 85),
(3, 2, 'HD Nature Video', 'High definition nature footage @ 30fps.', 'video', 'approved', '1:05', 240);

-- SEED MEDIA (Link files to posts)
-- Note: File sizes are estimates/placeholders. Paths match actual files in backend/uploads/
INSERT INTO media (post_id, file_path, file_type, file_size) VALUES
(1, 'uploads/1769418714_digital-art-with-person-looking-city-landscape.jpg', 'image/jpeg', 2453132),
(2, 'uploads/1769418701_dark-cyberpunk-i-free-background-music-i-free-music-lab-release-469493.mp3', 'audio/mpeg', 3802592),
(3, 'uploads/1769418563_7102266-hd_1920_1080_30fps.mp4', 'video/mp4', 12551160);
