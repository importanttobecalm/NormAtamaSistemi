-- Fix Turkish characters in database
USE norm_atama_db;

-- Update teacher names with correct Turkish characters
UPDATE teachers
SET first_name = 'Mehmet', last_name = 'Yılmaz', current_assignment = 'Ankara Atatürk İlkokulu'
WHERE tc_id = '12345678901';

UPDATE teachers
SET first_name = 'Ayşe', last_name = 'Demir', current_assignment = 'İstanbul Fatih Ortaokulu'
WHERE tc_id = '12345678902';

UPDATE teachers
SET first_name = 'Ali', last_name = 'Kaya', current_assignment = 'İzmir Konak Lisesi'
WHERE tc_id = '12345678903';

-- Update position names with correct Turkish characters
UPDATE positions
SET school_name = 'Ankara Çankaya İlkokulu'
WHERE id = 1;

UPDATE positions
SET school_name = 'İstanbul Beşiktaş Ortaokulu'
WHERE id = 2;

UPDATE positions
SET school_name = 'İzmir Bornova Lisesi'
WHERE id = 3;

UPDATE positions
SET school_name = 'Bursa Osmangazi İlkokulu'
WHERE id = 4;

UPDATE positions
SET school_name = 'Antalya Muratpaşa Ortaokulu'
WHERE id = 5;