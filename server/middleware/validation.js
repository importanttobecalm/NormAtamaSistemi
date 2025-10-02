const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Doğrulama hatası',
            errors: errors.array()
        });
    }
    next();
};

const validateTeacher = [
    body('tcId')
        .isLength({ min: 11, max: 11 })
        .withMessage('TC kimlik numarası 11 haneli olmalıdır')
        .isNumeric()
        .withMessage('TC kimlik numarası sadece rakam içermelidir'),
    body('firstName')
        .isLength({ min: 2, max: 50 })
        .withMessage('Ad 2-50 karakter arasında olmalıdır')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
        .withMessage('Ad sadece harf içermelidir'),
    body('lastName')
        .isLength({ min: 2, max: 50 })
        .withMessage('Soyad 2-50 karakter arasında olmalıdır')
        .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
        .withMessage('Soyad sadece harf içermelidir'),
    body('birthDate')
        .isDate()
        .withMessage('Geçerli bir doğum tarihi giriniz'),
    body('placementPoints')
        .isFloat({ min: 0, max: 999.99 })
        .withMessage('Yerleştirme puanı 0-999.99 arasında olmalıdır'),
    body('branch')
        .isLength({ min: 2, max: 100 })
        .withMessage('Branş 2-100 karakter arasında olmalıdır'),
    body('currentAssignment')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Mevcut görev yeri en fazla 200 karakter olmalıdır'),
    handleValidationErrors
];

const validatePosition = [
    body('schoolName')
        .isLength({ min: 2, max: 200 })
        .withMessage('Okul adı 2-200 karakter arasında olmalıdır'),
    body('district')
        .isLength({ min: 2, max: 100 })
        .withMessage('İlçe 2-100 karakter arasında olmalıdır'),
    body('branch')
        .isLength({ min: 2, max: 100 })
        .withMessage('Branş 2-100 karakter arasında olmalıdır'),
    body('quota')
        .isInt({ min: 1, max: 50 })
        .withMessage('Kontenjan 1-50 arasında olmalıdır'),
    handleValidationErrors
];

const validatePreferencePeriod = [
    body('startDate')
        .isISO8601()
        .withMessage('Geçerli bir başlangıç tarihi giriniz'),
    body('endDate')
        .isISO8601()
        .withMessage('Geçerli bir bitiş tarihi giriniz')
        .custom((endDate, { req }) => {
            if (new Date(endDate) <= new Date(req.body.startDate)) {
                throw new Error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
            }
            return true;
        }),
    handleValidationErrors
];

const validateAdminLogin = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Kullanıcı adı 3-50 karakter arasında olmalıdır')
        .trim(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Şifre en az 8 karakter olmalıdır')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'),
    handleValidationErrors
];

const validateTeacherLogin = [
    body('tcId')
        .isLength({ min: 11, max: 11 })
        .withMessage('TC kimlik numarası 11 haneli olmalıdır')
        .isNumeric()
        .withMessage('TC kimlik numarası sadece rakam içermelidir'),
    body('birthDate')
        .matches(/^\d{2}\.\d{2}\.\d{4}$/)
        .withMessage('Doğum tarihi GG.AA.YYYY formatında olmalıdır'),
    handleValidationErrors
];

const validatePreferences = [
    body('preferences')
        .isArray({ max: 25 })
        .withMessage('En fazla 25 tercih yapılabilir'),
    body('preferences.*.positionId')
        .isInt({ min: 1 })
        .withMessage('Geçerli bir pozisyon seçiniz'),
    body('preferences.*.rank')
        .isInt({ min: 1, max: 25 })
        .withMessage('Tercih sırası 1-25 arasında olmalıdır'),
    handleValidationErrors
];

module.exports = {
    validateTeacher,
    validatePosition,
    validatePreferencePeriod,
    validateAdminLogin,
    validateTeacherLogin,
    validatePreferences,
    handleValidationErrors
};