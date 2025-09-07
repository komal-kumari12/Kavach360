const asyncHandler = require('express-async-handler');
const Tourist = require('../models/tourist.model');
const EFIR = require('../models/efir.model');
const { generatePDF } = require('../utils/pdf-generator');

/**
 * @desc    Get all E-FIRs
 * @route   GET /api/efir
 * @access  Private
 */
const getAllEFIRs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    // Apply filters if provided
    if (req.query.status) {
        filter.status = req.query.status;
    }
    
    if (req.query.search) {
        filter.$or = [
            { efirNumber: { $regex: req.query.search, $options: 'i' } },
            { 'touristDetails.name': { $regex: req.query.search, $options: 'i' } },
            { 'touristDetails.digitalId': { $regex: req.query.search, $options: 'i' } },
            { 'touristDetails.passportNumber': { $regex: req.query.search, $options: 'i' } }
        ];
    }
    
    const total = await EFIR.countDocuments(filter);
    const efirs = await EFIR.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    res.status(200).json({
        success: true,
        data: efirs,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Get E-FIR by ID
 * @route   GET /api/efir/:id
 * @access  Private
 */
const getEFIRById = asyncHandler(async (req, res) => {
    const efir = await EFIR.findById(req.params.id);
    
    if (!efir) {
        res.status(404);
        throw new Error('E-FIR not found');
    }
    
    res.status(200).json({
        success: true,
        data: efir
    });
});

/**
 * @desc    Create new E-FIR
 * @route   POST /api/efir
 * @access  Private
 */
const createEFIR = asyncHandler(async (req, res) => {
    const { 
        touristId, 
        incidentDate, 
        incidentTime, 
        incidentLocation, 
        incidentDescription 
    } = req.body;
    
    // Validate required fields
    if (!touristId || !incidentDate || !incidentLocation || !incidentDescription) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }
    
    // Get tourist details
    const tourist = await Tourist.findById(touristId);
    if (!tourist) {
        res.status(404);
        throw new Error('Tourist not found');
    }
    
    // Generate E-FIR number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const efirNumber = `EFIR-${year}${month}${day}-${random}`;
    
    // Create E-FIR
    const efir = await EFIR.create({
        efirNumber,
        touristId: tourist._id,
        touristDetails: {
            name: tourist.name,
            digitalId: tourist.digitalId,
            nationality: tourist.nationality,
            passportNumber: tourist.passportNumber,
            age: tourist.age,
            gender: tourist.gender,
            phone: tourist.phone,
            email: tourist.email
        },
        incidentDetails: {
            date: incidentDate,
            time: incidentTime || '',
            location: incidentLocation,
            description: incidentDescription
        },
        lastKnownLocation: tourist.lastKnownLocation,
        reportedBy: {
            userId: req.user._id,
            name: req.user.name,
            role: req.user.role
        },
        status: 'pending',
        verificationId: 'v-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    });
    
    if (efir) {
        res.status(201).json({
            success: true,
            data: {
                efirId: efir._id,
                efirNumber: efir.efirNumber
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid E-FIR data');
    }
});

/**
 * @desc    Update E-FIR status
 * @route   PATCH /api/efir/:id/status
 * @access  Private
 */
const updateEFIRStatus = asyncHandler(async (req, res) => {
    const { status, remarks } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected', 'closed'].includes(status)) {
        res.status(400);
        throw new Error('Please provide a valid status');
    }
    
    const efir = await EFIR.findById(req.params.id);
    
    if (!efir) {
        res.status(404);
        throw new Error('E-FIR not found');
    }
    
    efir.status = status;
    if (remarks) {
        efir.statusHistory.push({
            status,
            remarks,
            updatedBy: {
                userId: req.user._id,
                name: req.user.name,
                role: req.user.role
            },
            timestamp: new Date()
        });
    }
    
    const updatedEFIR = await efir.save();
    
    res.status(200).json({
        success: true,
        data: updatedEFIR
    });
});

/**
 * @desc    Get E-FIR templates
 * @route   GET /api/efir/templates
 * @access  Private
 */
const getEFIRTemplates = asyncHandler(async (req, res) => {
    // Mock templates for now
    const templates = [
        {
            id: 'template1',
            name: 'Standard Missing Person',
            description: 'The tourist was last seen at the specified location and time. The tourist has not returned to their accommodation and has not made contact with their travel companions or family members. All attempts to reach the tourist via phone or messaging apps have been unsuccessful.'
        },
        {
            id: 'template2',
            name: 'Tourist in Restricted Area',
            description: 'The tourist was last tracked entering a restricted or dangerous area despite warnings and has not been seen or heard from since. The tourist may have ventured into an area with poor network coverage or challenging terrain.'
        },
        {
            id: 'template3',
            name: 'Medical Emergency',
            description: 'The tourist has a known medical condition that requires regular medication or treatment. The tourist has missed scheduled check-ins and has not been seen taking their medication. There is concern for their health and well-being.'
        }
    ];
    
    res.status(200).json({
        success: true,
        data: templates
    });
});

/**
 * @desc    Get E-FIR template by ID
 * @route   GET /api/efir/templates/:id
 * @access  Private
 */
const getEFIRTemplateById = asyncHandler(async (req, res) => {
    // Mock templates for now
    const templates = {
        template1: {
            id: 'template1',
            name: 'Standard Missing Person',
            description: 'The tourist was last seen at the specified location and time. The tourist has not returned to their accommodation and has not made contact with their travel companions or family members. All attempts to reach the tourist via phone or messaging apps have been unsuccessful.'
        },
        template2: {
            id: 'template2',
            name: 'Tourist in Restricted Area',
            description: 'The tourist was last tracked entering a restricted or dangerous area despite warnings and has not been seen or heard from since. The tourist may have ventured into an area with poor network coverage or challenging terrain.'
        },
        template3: {
            id: 'template3',
            name: 'Medical Emergency',
            description: 'The tourist has a known medical condition that requires regular medication or treatment. The tourist has missed scheduled check-ins and has not been seen taking their medication. There is concern for their health and well-being.'
        }
    };
    
    const template = templates[req.params.id];
    
    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }
    
    res.status(200).json({
        success: true,
        data: template
    });
});

/**
 * @desc    Generate E-FIR PDF
 * @route   GET /api/efir/:id/pdf
 * @access  Private
 */
const generateEFIRPDF = asyncHandler(async (req, res) => {
    const efir = await EFIR.findById(req.params.id);
    
    if (!efir) {
        res.status(404);
        throw new Error('E-FIR not found');
    }
    
    // Generate PDF
    const pdfBuffer = await generatePDF(efir);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="EFIR-${efir.efirNumber}.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
});

/**
 * @desc    Verify E-FIR
 * @route   GET /api/efir/verify/:verificationId
 * @access  Public
 */
const verifyEFIR = asyncHandler(async (req, res) => {
    const efir = await EFIR.findOne({ verificationId: req.params.verificationId });
    
    if (!efir) {
        res.status(404);
        throw new Error('Invalid verification ID');
    }
    
    res.status(200).json({
        success: true,
        data: {
            efirNumber: efir.efirNumber,
            touristName: efir.touristDetails.name,
            digitalId: efir.touristDetails.digitalId,
            reportDate: efir.createdAt,
            status: efir.status,
            isVerified: true
        }
    });
});

module.exports = {
    getAllEFIRs,
    getEFIRById,
    createEFIR,
    updateEFIRStatus,
    getEFIRTemplates,
    getEFIRTemplateById,
    generateEFIRPDF,
    verifyEFIR
};