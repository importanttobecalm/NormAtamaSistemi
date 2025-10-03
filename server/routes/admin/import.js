const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const bcrypt = require("bcryptjs");
const { pool } = require("../../config/database");
const { adminAuthMiddleware } = require("../../middleware/auth");

// Configure multer for memory storage with size limits
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
        files: 1 // Only one file at a time
    },
    fileFilter: (req, file, cb) => {
        // Only accept Excel files
        const allowedMimes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel.sheet.macroEnabled.12'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Sadece Excel dosyaları (.xls, .xlsx) kabul edilir'));
        }
    }
});

// Bulk import teachers from Excel
router.post(
  "/teachers",
  adminAuthMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Dosya yüklenmedi" });
      }

      // Parse Excel file
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return res.status(400).json({ message: "Excel dosyası boş" });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Expected columns: TC, Ad, Soyad, Doğum Tarihi (GG.AA.YYYY), Puan, Branş, Mevcut Atama
          const tcId = String(row["TC"] || row["TC Kimlik"] || "").trim();
          const firstName = String(row["Ad"] || row["Adı"] || "").trim();
          const lastName = String(row["Soyad"] || row["Soyadı"] || "").trim();
          const birthDateStr = String(
            row["Doğum Tarihi"] || row["Dogum Tarihi"] || ""
          ).trim();
          const points = parseFloat(row["Puan"] || row["Atama Puanı"] || 0);
          const branch = String(row["Branş"] || row["Brans"] || "").trim();
          const currentAssignment = String(
            row["Mevcut Atama"] || row["Atama"] || ""
          ).trim();

          // Validate required fields
          if (!tcId || tcId.length !== 11) {
            errors.push(`Satır ${i + 2}: Geçersiz TC kimlik numarası`);
            errorCount++;
            continue;
          }

          if (!firstName || !lastName) {
            errors.push(`Satır ${i + 2}: Ad ve soyad gerekli`);
            errorCount++;
            continue;
          }

          if (!birthDateStr) {
            errors.push(`Satır ${i + 2}: Doğum tarihi gerekli`);
            errorCount++;
            continue;
          }

          // Parse birth date (DD.MM.YYYY)
          let birthDate;
          if (birthDateStr.includes(".")) {
            const [day, month, year] = birthDateStr.split(".");
            birthDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
              2,
              "0"
            )}`;
          } else {
            errors.push(
              `Satır ${i + 2}: Doğum tarihi formatı hatalı (GG.AA.YYYY olmalı)`
            );
            errorCount++;
            continue;
          }

          // Hash password (birth date)
          const passwordHash = await bcrypt.hash(birthDateStr, 10);

          // Insert or update teacher
          await pool.execute(
            `INSERT INTO teachers (tc_id, first_name, last_name, birth_date, placement_points, branch, current_assignment, password_hash)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                     first_name = VALUES(first_name),
                     last_name = VALUES(last_name),
                     birth_date = VALUES(birth_date),
                     placement_points = VALUES(placement_points),
                     branch = VALUES(branch),
                     current_assignment = VALUES(current_assignment),
                     password_hash = VALUES(password_hash)`,
            [
              tcId,
              firstName,
              lastName,
              birthDate,
              points,
              branch,
              currentAssignment,
              passwordHash,
            ]
          );

          successCount++;
        } catch (error) {
          console.error(`Error importing row ${i + 2}:`, error);
          errors.push(`Satır ${i + 2}: ${error.message}`);
          errorCount++;
        }
      }

      res.json({
        message: `İçe aktarma tamamlandı`,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Return first 10 errors
      });
    } catch (error) {
      console.error("Bulk import teachers error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

// Bulk import positions from Excel
router.post(
  "/positions",
  adminAuthMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Dosya yüklenmedi" });
      }

      // Parse Excel file
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return res.status(400).json({ message: "Excel dosyası boş" });
      }

      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // Expected columns: Okul Adı, İlçe, Branş, Kontenjan, Durum
          const schoolName = String(
            row["Okul Adı"] || row["Okul"] || ""
          ).trim();
          const district = String(row["İlçe"] || row["Ilce"] || "").trim();
          const branch = String(row["Branş"] || row["Brans"] || "").trim();
          const quota = parseInt(row["Kontenjan"] || row["Kota"] || 1);
          const statusStr = String(row["Durum"] || "Aktif")
            .trim()
            .toLowerCase();
          const status =
            statusStr === "aktif" || statusStr === "active"
              ? "active"
              : "inactive";

          // Validate required fields
          if (!schoolName) {
            errors.push(`Satır ${i + 2}: Okul adı gerekli`);
            errorCount++;
            continue;
          }

          if (!district) {
            errors.push(`Satır ${i + 2}: İlçe gerekli`);
            errorCount++;
            continue;
          }

          if (!branch) {
            errors.push(`Satır ${i + 2}: Branş gerekli`);
            errorCount++;
            continue;
          }

          // Insert position
          await pool.execute(
            `INSERT INTO positions (school_name, district, branch, quota, status)
                     VALUES (?, ?, ?, ?, ?)`,
            [schoolName, district, branch, quota, status]
          );

          successCount++;
        } catch (error) {
          console.error(`Error importing row ${i + 2}:`, error);
          errors.push(`Satır ${i + 2}: ${error.message}`);
          errorCount++;
        }
      }

      res.json({
        message: `İçe aktarma tamamlandı`,
        successCount,
        errorCount,
        errors: errors.slice(0, 10), // Return first 10 errors
      });
    } catch (error) {
      console.error("Bulk import positions error:", error);
      res.status(500).json({ message: "Sunucu hatası" });
    }
  }
);

module.exports = router;
