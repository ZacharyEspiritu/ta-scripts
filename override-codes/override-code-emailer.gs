/**
* Mails out override codes.
*
* Usage: 
*   1. Check that OVERRIDE_CODES_SPREADSHEET_URL points to a spreadsheet with the override codes;
*      the format is (the first row is the start of the data, so no table headers permitted):
*
*           EMAIL | OVERRIDE_CODE
*           EMAIL | OVERRIDE_CODE
*           ...
*
*   2. Update the course-specific information included in the email (COURSE_CODE, HTA_EMAIL_ADDRESS,
*      DEADLINE_TO_USE_OVERRIDE).
*
*   3. Run the `mailOverrideCodes` function by selecting it in the above dropdown and pressing the 
*      Run button. Override codes will be emailed out.
*
* Written by zespirit on 09/13/18.
*
* Changelog:
*   - 09/13/18 (zespirit): Initial version for CSCI0190.
*   - 01/29/19 (zespirit): Updated for CSCI1660.
*   - 03/22/19 (zespirit): Updated for general use.
*/

// MODIFY: A link to a Google Spreadsheet containing the override codes.
const OVERRIDE_CODES_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/REPLACE-ME/edit";

// MODIFY: Course-specific information. 
const COURSE_CODE              = "CSCI1660";
const HTA_EMAIL_ADDRESS        = "cs1660headtas@lists.brown.edu";
const DEADLINE_TO_USE_OVERRIDE = "9:00 PM tomorrow (Monday, February 4)";

/**
 * Mails out override codes from the OVERRIDE_CODES_SPREADSHEET_URL specified above.
 */
function mailOverrideCodes() {
  // Get the data from the spreadsheet:
  var codesSpreadsheet = SpreadsheetApp.openByUrl(OVERRIDE_CODES_SPREADSHEET_URL);
  var codesSheet       = codesSpreadsheet.getSheets()[0];
  var codesData        = codesSheet.getRange("A1:B1000").getValues();
  
  // Iterate over all of the rows in the spreadsheet:
  for (var i = 0; i < codesData.length; i++) {
    // Parse the first two entries in each row according to the specification above:
    var row          = codesData[i];
    var studentEmail = row[0];
    var overrideCode = row[1];
    
    if (studentEmail == "" || overrideCode == "") {
      // Once we reach an empty line, stop iterating:
      break;
    }
    else {
      // Make a fancy header:
      var emailSubject = "[" + COURSE_CODE + "] Override Code for " + COURSE_CODE;
      
      // Build the email text:
      var emailBody = "Hi there,<br><br>";
      
      emailBody += "Your override code to register for " + COURSE_CODE + " is <b>" + overrideCode + "</b>. ";
      emailBody += "Note that your override code is unique to you, so please do not share it with ";
      emailBody += "other students.<br><br>";
      
      emailBody += "<b>You must register for the course by " + DEADLINE_TO_USE_OVERRIDE + ";</b> otherwise, ";
      emailBody += "we will move to the next student on the waitlist. Please email " + HTA_EMAIL_ADDRESS;
      emailBody += "if you have any questions.<br><br>";
      
      emailBody += "Best,<br>";
      emailBody += "The " + COURSE_CODE + " HTAs";
      
      // Add the student email and override code to the Logger for debugging purposes:
      Logger.log(studentEmail);
      Logger.log(overrideCode);
      
      // Send the override code to the student:
      MailApp.sendEmail(studentEmail, emailSubject, "", {
        name: "The " + COURSE_CODE + " HTAs",
        replyTo: HTA_EMAIL_ADDRESS,
        htmlBody: emailBody
      });
    }
  }
}
