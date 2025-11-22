/**
 * Google Apps Script for St. John's Catholic Cathedral Bauchi
 * Church Membership Registration System with Duplicate Prevention
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with this script
 * 4. Save and deploy as Web App with public access
 * 5. Copy the Web App URL to your frontend code
 */

function doGet(e) {
  // Handle GET requests (duplicate checking)
  const action = e.parameter.action;
  
  if (action === 'checkDuplicate') {
    return checkForDuplicate(e.parameter.phone);
  }
  
  // Default response for invalid GET requests
  return ContentService
    .createTextOutput(JSON.stringify({
      error: 'Invalid action. Use action=checkDuplicate with phone parameter.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Handle POST requests (form submissions)
  const action = e.parameter.action;
  
  if (action === 'submit') {
    return submitRegistration(e.parameter);
  }
  
  // Default response for invalid POST requests
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: 'Invalid action. Use action=submit for form submissions.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Check if a phone number already exists in the registration database
 * @param {string} phone - Phone number to check
 * @returns {ContentService.TextOutput} JSON response with duplicate status
 */
function checkForDuplicate(phone) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row (index 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const existingPhone = row[2]; // Phone is in column C (index 2)
      
      // Clean both phone numbers for comparison
      const cleanExisting = cleanPhoneNumber(existingPhone);
      const cleanInput = cleanPhoneNumber(phone);
      
      if (cleanExisting === cleanInput && cleanExisting !== '') {
        return ContentService
          .createTextOutput(JSON.stringify({
            isDuplicate: true,
            existingMember: {
              name: row[0] || 'Unknown', // Name in column A
              email: row[1] || '', // Email in column B
              registrationDate: formatDate(row[8]) || 'Unknown' // Timestamp in column I
            }
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // No duplicate found
    return ContentService
      .createTextOutput(JSON.stringify({isDuplicate: false}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        isDuplicate: false, 
        error: 'Failed to check duplicates: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Submit a new registration to the Google Sheet
 * @param {Object} params - Form parameters from the frontend
 * @returns {ContentService.TextOutput} JSON response with submission status
 */
function submitRegistration(params) {
  try {
    const sheet = getOrCreateSheet();
    
    // Prepare row data in the correct order
    const rowData = [
      params.fullName || '',           // Column A: Name
      params.email || '',              // Column B: Email
      params.phone || '',              // Column C: Phone
      params.homeAddress || '',        // Column D: Home Address
      params.gender || '',             // Column E: Gender
      params.dateOfBirth || '',        // Column F: Date of Birth
      params.maritalStatus || '',      // Column G: Marital Status
      params.society || '',            // Column H: Society Interest
      new Date().toISOString()         // Column I: Timestamp
    ];
    
    // Add the new registration
    sheet.appendRow(rowData);
    
    // Log successful registration
    console.log('New registration added:', params.fullName, params.phone);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Registration submitted successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error submitting registration:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to submit registration: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get the registration sheet or create it if it doesn't exist
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The registration sheet
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('Registrations');
  
  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = spreadsheet.insertSheet('Registrations');
    initializeSheet(sheet);
  } else if (sheet.getLastRow() === 0) {
    // Initialize if sheet exists but is empty
    initializeSheet(sheet);
  }
  
  return sheet;
}

/**
 * Initialize the sheet with headers and formatting
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to initialize
 */
function initializeSheet(sheet) {
  const headers = [
    'Full Name',
    'Email',
    'Phone Number',
    'Home Address',
    'Gender',
    'Date of Birth',
    'Marital Status',
    'Society',
    'Registration Date'
  ];
  
  // Set headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  
  // Format header row
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1e40af'); // Blue background
  headerRange.setFontColor('white');
  headerRange.setHorizontalAlignment('center');
  
  // Set column widths for better readability
  sheet.setColumnWidth(1, 200); // Full Name
  sheet.setColumnWidth(2, 250); // Email
  sheet.setColumnWidth(3, 150); // Phone
  sheet.setColumnWidth(4, 300); // Home Address
  sheet.setColumnWidth(5, 100); // Gender
  sheet.setColumnWidth(6, 120); // Date of Birth
  sheet.setColumnWidth(7, 120); // Marital Status
  sheet.setColumnWidth(8, 200); // Society Interest
  sheet.setColumnWidth(9, 180); // Registration Date
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  console.log('Sheet initialized with headers and formatting');
}

/**
 * Clean and normalize phone numbers for comparison
 * @param {string} phone - Raw phone number
 * @returns {string} Cleaned phone number
 */
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  
  // Convert to string and remove all non-digit characters except +
  let cleaned = phone.toString().replace(/[^\d+]/g, '');
  
  // Convert +234 format to 0 format for consistent comparison
  if (cleaned.startsWith('+234')) {
    cleaned = '0' + cleaned.substring(4);
  }
  
  // Remove any remaining + signs
  cleaned = cleaned.replace(/\+/g, '');
  
  return cleaned;
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return date.toString();
  }
}

/**
 * Test function to verify the script is working
 * Run this function manually to test your setup
 */
function testScript() {
  console.log('Testing Google Apps Script...');
  
  // Test sheet creation
  const sheet = getOrCreateSheet();
  console.log('Sheet created/accessed successfully');
  
  // Test duplicate checking
  const duplicateResult = checkForDuplicate('08012345678');
  console.log('Duplicate check result:', duplicateResult.getContent());
  
  console.log('Script test completed successfully!');
}

/**
 * Get registration statistics
 * Run this function to get a summary of registrations
 */
function getRegistrationStats() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      console.log('No registrations found');
      return;
    }
    
    const totalRegistrations = data.length - 1; // Exclude header
    const societyCount = {};
    const genderCount = {};
    
    // Count by society and gender
    for (let i = 1; i < data.length; i++) {
      const society = data[i][7] || 'Unknown';
      const gender = data[i][4] || 'Unknown';
      
      societyCount[society] = (societyCount[society] || 0) + 1;
      genderCount[gender] = (genderCount[gender] || 0) + 1;
    }
    
    console.log('=== REGISTRATION STATISTICS ===');
    console.log('Total Registrations:', totalRegistrations);
    console.log('By Society:', societyCount);
    console.log('By Gender:', genderCount);
    
  } catch (error) {
    console.error('Error getting statistics:', error);
  }
}