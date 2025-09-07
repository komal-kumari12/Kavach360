/**
 * PDF Generator Utility
 * Handles generation of PDF documents for E-FIR reports
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate PDF for E-FIR report
 * @param {Object} efirData - E-FIR data to include in the PDF
 * @returns {Promise<String>} - Path to the generated PDF file
 */
exports.generateEFIRPdf = async (efirData) => {
    try {
        // In a real implementation, this would use a PDF generation library like PDFKit
        // For this demo, we'll just return a mock file path
        
        const mockPdfPath = path.join(__dirname, '..', '..', 'uploads', 'efir', `${efirData.efirNumber}.pdf`);
        
        // Ensure directory exists
        const dir = path.dirname(mockPdfPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Create a mock PDF file with some content
        const pdfContent = `
            E-FIR Report
            ------------
            
            E-FIR Number: ${efirData.efirNumber}
            Date: ${new Date().toISOString()}
            
            Tourist Information:
            Name: ${efirData.touristDetails.name}
            Digital ID: ${efirData.touristDetails.digitalId}
            Nationality: ${efirData.touristDetails.nationality}
            Passport: ${efirData.touristDetails.passportNumber}
            
            Incident Details:
            Date: ${efirData.incidentDetails.date}
            Location: ${efirData.incidentDetails.location}
            Description: ${efirData.incidentDetails.description}
        `;
        
        fs.writeFileSync(mockPdfPath, pdfContent);
        
        return mockPdfPath;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};

/**
 * Get PDF file as base64 string
 * @param {String} filePath - Path to the PDF file
 * @returns {String} - Base64 encoded PDF content
 */
exports.getPdfAsBase64 = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath);
        return fileContent.toString('base64');
    } catch (error) {
        console.error('Error reading PDF file:', error);
        throw new Error('Failed to read PDF file');
    }
};