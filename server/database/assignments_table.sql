-- Create assignments table for teacher placement results
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_tc_id VARCHAR(11) NOT NULL,
    position_id INT,
    preference_period_id INT NOT NULL,
    preference_rank INT,
    placement_points DECIMAL(10,2) NOT NULL,
    status ENUM('assigned', 'unassigned') DEFAULT 'unassigned',
    assigned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_tc_id) REFERENCES teachers(tc_id) ON DELETE CASCADE,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    FOREIGN KEY (preference_period_id) REFERENCES preference_periods(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_period (teacher_tc_id, preference_period_id),
    INDEX idx_teacher (teacher_tc_id),
    INDEX idx_position (position_id),
    INDEX idx_period (preference_period_id),
    INDEX idx_status (status)
);
