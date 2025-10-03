-- Create database
CREATE DATABASE IF NOT EXISTS norm_atama_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE norm_atama_db;

-- Admin users table
CREATE TABLE admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Teachers table
CREATE TABLE teachers (
    tc_id VARCHAR(11) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    placement_points DECIMAL(10,2) NOT NULL DEFAULT 0,
    branch VARCHAR(100) NOT NULL,
    current_assignment VARCHAR(200),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_branch (branch),
    INDEX idx_points (placement_points)
);

-- Open positions table
CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(200) NOT NULL,
    district VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    quota INT NOT NULL DEFAULT 1,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch (branch),
    INDEX idx_district (district),
    INDEX idx_status (status)
);

-- Preference periods table
CREATE TABLE preference_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status)
);

-- Teacher preferences table
CREATE TABLE preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_tc_id VARCHAR(11) NOT NULL,
    position_id INT NOT NULL,
    preference_rank INT NOT NULL,
    preference_period_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_tc_id) REFERENCES teachers(tc_id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
    FOREIGN KEY (preference_period_id) REFERENCES preference_periods(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_position_period (teacher_tc_id, position_id, preference_period_id),
    UNIQUE KEY unique_teacher_rank_period (teacher_tc_id, preference_rank, preference_period_id),
    INDEX idx_teacher (teacher_tc_id),
    INDEX idx_position (position_id),
    INDEX idx_period (preference_period_id),
    CHECK (preference_rank >= 1 AND preference_rank <= 25)
);

-- Refresh tokens table for persistent sessions
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'teacher') NOT NULL,
    token VARCHAR(512) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id)
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, role)
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Sample data for testing
INSERT INTO teachers (tc_id, first_name, last_name, birth_date, placement_points, branch, current_assignment, password_hash) VALUES
('12345678901', 'Mehmet', 'Yılmaz', '1985-05-15', 85.50, 'Matematik', 'Ankara Atatürk İlkokulu', '$2a$10$example_hash_1'),
('12345678902', 'Ayşe', 'Demir', '1982-03-22', 92.75, 'Türkçe', 'İstanbul Fatih Ortaokulu', '$2a$10$example_hash_2'),
('12345678903', 'Ali', 'Kaya', '1988-11-08', 78.25, 'Fen Bilgisi', 'İzmir Konak Lisesi', '$2a$10$example_hash_3');

INSERT INTO positions (school_name, district, branch, quota) VALUES
('Ankara Çankaya İlkokulu', 'Çankaya', 'Matematik', 2),
('İstanbul Beşiktaş Ortaokulu', 'Beşiktaş', 'Türkçe', 1),
('İzmir Bornova Lisesi', 'Bornova', 'Fen Bilgisi', 3),
('Bursa Osmangazi İlkokulu', 'Osmangazi', 'Matematik', 1),
('Antalya Muratpaşa Ortaokulu', 'Muratpaşa', 'Türkçe', 2);