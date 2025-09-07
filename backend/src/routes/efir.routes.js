const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    getAllEFIRs,
    getEFIRById,
    createEFIR,
    updateEFIRStatus,
    getEFIRTemplates,
    getEFIRTemplateById,
    generateEFIRPDF,
    verifyEFIR
} = require('../controllers/efir.controller');

// Public routes
router.get('/verify/:verificationId', verifyEFIR);

// Protected routes
router.route('/')
    .get(protect, getAllEFIRs)
    .post(protect, createEFIR);

router.get('/templates', protect, getEFIRTemplates);
router.get('/templates/:id', protect, getEFIRTemplateById);

router.route('/:id')
    .get(protect, getEFIRById);

router.patch('/:id/status', protect, updateEFIRStatus);
router.get('/:id/pdf', protect, generateEFIRPDF);

module.exports = router;