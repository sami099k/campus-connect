/**
 * Parse NITW student email to extract academic details
 * Format: sm24csb0a77@student.nitw.ac.in
 * sm - program (BTech), 24 - year, csb - branch, 0 - optional, a - section, 77 - roll
 */
function parseNITWEmail(email) {
  if (!email.endsWith('@student.nitw.ac.in')) {
    throw new Error('Invalid NITW email format');
  }

  const username = email.split('@')[0].toLowerCase();
  
  // Program mapping (first 2 chars)
  const programMap = {
    'sm': 'BTech',
    'mm': 'MTech',
    'pm': 'PhD',
    'im': 'Integrated',
  };
  
  // Branch mapping (3 chars after year)
  const branchMap = {
    'csb': 'CSE',
    'csb': 'CSE',
    'ecb': 'ECE',
    'eeb': 'EEE',
    'meb': 'MECH',
    'cib': 'CIVIL',
    'chb': 'CHEM',
    'meb': 'MME',
    'bib': 'BIOTECH',
  };

  try {
    // Extract components
    const programCode = username.substring(0, 2);
    const yearCode = username.substring(2, 4);
    const branchCode = username.substring(4, 7);
    
    // Find section (letter after branch code and optional digit)
    let sectionIndex = 7;
    // Skip optional digit (like '0' in csb0a77)
    if (!isNaN(username[sectionIndex])) {
      sectionIndex++;
    }
    const section = username[sectionIndex].toUpperCase();
    
    // Roll number is remaining digits
    const rollNumber = username.substring(sectionIndex + 1);
    
    // Map program
    const className = programMap[programCode] || 'BTech';
    
    // Map branch
    const branch = branchMap[branchCode] || branchCode.toUpperCase();
    
    // Calculate year (assuming 20XX format, e.g., 24 = 2024)
    const admissionYear = 2000 + parseInt(yearCode);
    const currentYear = new Date().getFullYear();
    const academicYear = currentYear - admissionYear + 1; // 1st year, 2nd year, etc.
    
    return {
      className,
      branch,
      year: Math.max(1, Math.min(academicYear, 5)), // Clamp between 1-5
      section,
      rollNumber,
      admissionYear,
    };
  } catch (error) {
    throw new Error('Failed to parse email format. Please ensure it follows NITW format.');
  }
}

module.exports = { parseNITWEmail };
