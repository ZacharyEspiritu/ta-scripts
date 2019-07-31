/**
 * Emails ("distributes") grade reports to students.
 *
 * The script is the heart of the grading infrastructure---it maps the
 * anonymous ID mapping spreadsheet with the grading spreadsheet to determine
 * which anonymized records in the grading spreadsheet correspond to a given
 * (unanonymized) student. Then, it "builds" grade reports for each student
 * using a "report template" (discussed more in depth below). Finally, it
 * emails the reports to each student.
 *
 * Created by zespirit on 06/28/18. (Originally based on the grade report
 * script created by lbresna1 and ssohani for CSCI0190, Fall 2017.)
 *
 * Changelog:
 *   - 06/28/18 (zespirit): Initial version for CSCI0190 (summer).
 *   - 09/01/18 (zespirit): Added code backtick formatting for CSCI0190.
 *   - 01/10/19 (zespirit): Added support for specifying a list of anonymous
 *               IDs whose grade reports should be the only ones sent out via
 *               the ONLY_IDS constant for CSCI1660.
 *   - 02/03/19 (zespirit): Added REVISED_TITLE constant to allow for the
 *               sending ofreports with the "Revised" title without having to
 *               mark the REVISIONS_ONLY constant for CSCI1660.
 *   - 03/23/19 (zespirit): Escaped HTML characters (<, >, etc.) from grading
 *               spreadsheet values before loading into grade report due to it
 *               breaking HTML-related comments in CSCI1660.
 *
 *
 * Control Spreadsheet
 * -------------------
 *
 * The CONTROL_SPREADSHEET constant defines the URL to the "control
 * spreadsheet", which is the centralizing spreadsheet for all grade
 * report-related content. The script uses this spreadsheet to determine where
 * to find the anonymous ID mapping spreadsheet, grading spreadsheet, and
 * report template for a given assignment.
 *
 * The first row in the control spreadsheet may be a header row; this row will
 * be ignored by the script.
 *
 * All subsequent rows must follow the following column order:
 *
 *   1. Assignment Name - a unique identifier for the assignment
 *   2. URL to Anonymous ID Mappings Spreadsheet (Google Spreadsheet)
 *   3. URL to Grading Spreadsheet (Google Spreadsheet)
 *   4. URL to Report Template Document (Google Docs)
 *
 *
 * Anonymous ID Mappings Spreadsheet
 * ---------------------------------
 *
 * TODO
 *
 *
 * Grading Spreadsheet
 * -------------------
 *
 * TODO
 *
 *
 * Report Templates
 * ----------------
 *
 * A "report template" is a Google Document written in GRBL (pronounced
 * "gerbil"), the "Grade Report Building Language". GRBL is a superset of
 * standard HTML that maps values in a column on the spreadsheet to locations
 * in a template to be emailed out to the students.
 *
 * Columns are uniquely identified on the spreadsheet with a "column
 * identifier", which are set on the 4th row on the spreadsheet. A value is
 * mapped from a column identifier using GRBL's "replacement operator":
 *
 *   ```
 *   {{column-identifier-goes-here}}
 *   ```
 *
 * For example, here's a really simple "report template" that maps values from
 * a single column with the identifier `final-score`:
 *
 *   ```
 *   Your grade is:
 *
 *   <center><b>Grade:</b> {{final-score}}</center>
 *   ```
 *
 * The grade report emailed to a student whose "final-score" column value was
 * 45 would recieve a grade report that looked something along the lines of:
 *
 *   +---------------------------------------------------------------------+
 *   |                                                                     |
 *   | Your grade is:                                                      |
 *   |                                                                     |
 *   |                           **Grade:** 45                             |
 *   |                                                                     |
 *   +---------------------------------------------------------------------+
 *
 * It looks a little nicer when it's actually formatted in a proper browser. :)
 *
 * There's also a little hidden feature in the "replacement operator"---text
 * loaded from the spreadsheet column that contains portions quoted with a
 * single backtick will display the quoted sections in monospaced "code" font
 * on the report, which can make your grade reports look a little nicer and
 * readable on the student-end when you're referring to specific code. For
 * example, given the following value in a spreadsheet:
 *
 *   Row 4 | column-identifier-with-code-ticks                 |
 *         +---------------------------------------------------+
 *   Row 5 | Your `mmap` function was very clean and readable! |
 *
 * If {{column-identifier-with-code-ticks}} is placed in a template, then the
 * word "mmap" will display as monospaced code font in the generated report
 * sent to the student.
 *
 * GRBL also supports the inclusion of "section headers", which are defined
 * with the following syntax:
 *
 *   ```
 *   {# Header Title Goes Here #}
 *   ```
 *
 * This adds a fancy header to the grade report whose background is the same
 * image background specified for the main grade report header. (See the
 * screenshots found in this script's repository for a visual example.) It's a
 * good way of keeping different rubric sections organized and readable for
 * students.
 *
 * GRBL supports a reasonable amount of HTML tags and formatting. Note that
 * different email clients display HTML _very_ differently, and so there might
 * be some trial-and-error involved based on how consistent you want your
 * grade reports to look across different platforms. (It's recommended to
 * focus on how your reports display in the mail.google.com web browser, since
 * it seems to be the default Brown University mail client.)
 *
 * Much, much more complex report templates can be created. See the samples
 * provided with this script for more information.
 */

// MODIFY: See "Control Spreadsheet" above. The URL points to a Google
// Spreadsheet; the "sheet name" should be set to the name of the sheet in that
// spreadsheet that contains the control data.
const CONTROL_SPREADSHEET_URL = "REPLACEME";
const CONTROL_SHEET_NAME      = "Control";

// MODIFY: The name of the assignment being emailed out.
const ASSIGNMENT_NAME = "REPLACEME";

// MODIFY: If `true`, sends grades to all students.
const SEND_EMAILS = false;

// MODIFY: If `true`, sends a single test email to the email address specified.
// The test email's contents are taken from the row of the first student to be
// emailed.
const SEND_SINGLE_TEST_EMAIL = false;
const TEST_EMAIL = "replaceme@brown.edu";

// MODIFY: If `ONLY_IDS` is non-empty, then the student identifers in that array
// are the only identifiers to be emailed out. If `IGNORED_IDS` is non-empty,
// then every row is emailed except for those rows containing student
// identifiers in the array. (At most one of `ONLY_IDS` and `IGNORED_IDS` should
// be non-empty.)
const ONLY_IDS = [];
const IGNORED_IDS = [];

// [DEPRECATED]: Legacy option. Use `ONLY_IDS` or `IGNORED_IDS` instead.
const REVISIONS_ONLY = false;
const REVISED_TITLE = false;

function sendGradeReports() {
  // Open up the Control Spreadsheet:
  var controlSS    = SpreadsheetApp.openByUrl(CONTROL_SPREADSHEET_URL);
  var controlSheet = controlSS.getSheetByName(CONTROL_SHEET_NAME);
  var controlRange = controlSheet.getRange("A2:E10000").getValues();

  // Look for the assignment information in the spreadsheet:
  var assignmentFound = false;
  var emailSettingsUrl, mappingsSpreadsheetUrl, gradingSpreadsheetUrl, reportTemplateUrl;
  for (var i = 0; i < controlRange.length; i++) {
    var asgnRow  = controlRange[i];
    var asgnName = asgnRow[0];
    if (asgnName == ASSIGNMENT_NAME) {
      assignmentFound        = true;
      emailSettingsUrl       = asgnRow[1];
      mappingsSpreadsheetUrl = asgnRow[2];
      gradingSpreadsheetUrl  = asgnRow[3];
      reportTemplateUrl      = asgnRow[4];
      break;
    }
  }

  // If we weren't able to find the assignment, raise an error:
  if (!assignmentFound) {
     throw "Assignment " + ASSIGNMENT_NAME + " not found in Control Spreadsheet (" + CONTROL_SPREADSHEET_URL + ")";
  }

  // Open mappings spreadsheet:
  var mappingsSS = SpreadsheetApp.openByUrl(mappingsSpreadsheetUrl);
  var mappingsSheet = mappingsSS.getSheets()[0];
  var submitRange = mappingsSheet.getRange("A2:B10000").getValues();
  var studentNames = []
  var studentIds = []

  // Extract all student ids and mappings:
  for(var x = 0; x < submitRange.length; x++){
    if(submitRange[x][0] == ""){
      continue;
    }
    studentNames.push(submitRange[x][0]);
    studentIds.push(submitRange[x][1]);
  }

  // Function that converts ID to email:
  var getStudentEmail = function(studentId){
    for(z = 0; z < studentIds.length; z++) {
      if(studentId == studentIds[z]) {
        return studentNames[z];
      }
    }
    return "__fail__"; // underscore to avoid naming conflicts with a student
                       // login, just in case!
  }

  // Extract settings from settings sheet:
  var settingsSheet  = SpreadsheetApp.openByUrl(emailSettingsUrl).getSheets()[0];
  var settingsValues = settingsSheet.getRange("B1:B10").getValues();
  var introText      = settingsValues[0];

  // Extract template from the supplied reportTemplateUrl:
  var reportDocument = DocumentApp.openByUrl(reportTemplateUrl);
  var templateText   = reportDocument.getBody().getText();

  // Extract grading sheet
  var gradingSheet  = SpreadsheetApp.openByUrl(gradingSpreadsheetUrl).getSheets()[0];
  var gradingValues = gradingSheet.getRange("A2:EZ1000").getValues();

  var sectionHeaders = gradingValues[0];
  var emailTags      = gradingValues[2];

  // Get image header:
  var headerImageBlob = UrlFetchApp.fetch("https://i.imgur.com/OexiTV8.jpg").getBlob();

  // Loop over all values in the spreadsheet starting at Row 5:
  var emailCount = 0;
  for (var i = 3; i < gradingValues.length; i++) {
    var row = gradingValues[i];
    var studentId = row[0];
    var graderLogin = row[1];
    var wasRevised = row[2] == "TRUE" || row[2] == true;
    var studentEmail = getStudentEmail(studentId) + "@cs.brown.edu";

    var subject = "[cs1660] " + ASSIGNMENT_NAME + " Grade Report for " + getStudentEmail(studentId);
    if (REVISIONS_ONLY || REVISED_TITLE) {
      subject = "[cs1660] Revised " + ASSIGNMENT_NAME + " Grade Report for " + getStudentEmail(studentId);
    }

    if (studentId == "") {
      Logger.log("Skipping row #" + (i + 1) + "... (blank id)");
      continue;
    }

    if (graderLogin == "") {
      Logger.log("Skipping row #" + (i + 1) + "... (grader login + " + studentId + ")");
      continue;
    }

    if (getStudentEmail(studentId) == "fail") {
      Logger.log("Skipping row #" + (i + 1) + "... (email failed)");
      continue;
    }

    if (ONLY_IDS.length > 0 && ONLY_IDS.indexOf(studentId) < 0) {
      Logger.log("Ignoring ID #" + studentId + "...");
      continue;
    }

    if (IGNORED_IDS.indexOf(studentId) >= 0) {
      Logger.log("Ignoring ID #" + studentId + "...");
      continue;
    }

    if (REVISIONS_ONLY && !wasRevised) {
      Logger.log("Skipping ID #" + studentId + " since only sending out revisions...");
      continue;
    } else if (REVISIONS_ONLY) {
      Logger.log("Sending revised grade report to ID #" + studentId + "...");
    }

    var replyTo = graderLogin + "@cs.brown.edu";

    // Assemble email body:
    var emailBody = introText;
    emailBody += "\n\n\n\n";
    emailBody += "<table align=\"center\" width=\"600\" style=\"width: 100%; max-width: 600px; border-collapse: collapse; border: 1px solid black;\">";

    // Add the header to the grade report box:
    emailBody += '<center><table cellpadding="0" cellspacing="0" border="0" height="120" width="100%">';
    emailBody +=   '<tr>';
    emailBody +=     '<td background="cid:headerImage" bgcolor="#7bceeb" valign="top">';
    emailBody +=     '<!--[if gte mso 9]>';
    emailBody +=     '<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="mso-width-percent:1000;height:120px;">';
    emailBody +=     '<v:fill type="tile" src="cid:headerImage" color="#7bceeb" />';
    emailBody +=     '<v:textbox inset="0,0,0,0">';
    emailBody +=     '<![endif]-->';
    emailBody +=     '<div>';
    emailBody += "<table height=\"30\"></table>";
    emailBody += "<center><span style='color: white; font-size: 50px; font-family: Avenir,Century Gothic,Montserrat,Segoe UI,Roboto,sans-serif;'><b>";
    emailBody += "&nbsp;" + ASSIGNMENT_NAME + "&nbsp;";
    emailBody += "</b></span></center>";
    emailBody +=     '</div>';
    emailBody +=     '<!--[if gte mso 9]>';
    emailBody +=     '</v:textbox>';
    emailBody +=     '</v:rect>';
    emailBody +=     '<![endif]-->';
    emailBody +=     '</td>';
    emailBody +=   '</tr>';
    emailBody += '</table></center>';

    // Include the actual grade report template within the grade report body:
    emailBody +=   "<table height=\"15\"></table>";
    emailBody +=     "<table align=\"center\" width=\"570\">";
    emailBody +=       populateTemplate(templateText, row, emailTags);
    emailBody +=     "</table>";
    emailBody +=   "<table height=\"15\"></table>";
    emailBody += "</table>\n\n";

    // Convert all newlines to <br> statements:
    emailBody = convertNewlinesToHTMLTags(emailBody);

    // Log the studentId and the studentEmail:
    Logger.log(studentId);
    Logger.log(studentEmail);

    // Route the email to the correct send request:
    if (SEND_SINGLE_TEST_EMAIL) {
      MailApp.sendEmail(TEST_EMAIL, subject, "", {
        name: "The CS166 TAs",
        replyTo: replyTo,
        htmlBody: emailBody,
        inlineImages: {
          headerImage: headerImageBlob
        }
      });
      break;
    }
    else if (SEND_EMAILS) {
      MailApp.sendEmail(studentEmail, subject, "", {
        name: "The CS166 TAs",
        replyTo: replyTo,
        htmlBody: emailBody,
        inlineImages: {
          headerImage: headerImageBlob
        }
      });
    }

    // Increment the email counter:
    emailCount++;
  }

  // Print out how many emails were sent:
  Logger.log(emailCount + " emails sent.");
}

function convertNewlinesToHTMLTags(str) {
  // Find all newlines and replace with <br> tags:
  return str.replace(/\n/g, "<br>");
}

function populateTemplate(template, gradeRow, emailTags) {
  // Populate section headers
  template = populateSectionHeaders(template);

  // Populate email tags
  for (var i = 0; i < emailTags.length && i < gradeRow.length; i++) {
    var currentTag = emailTags[i];
    var tagValue = gradeRow[i];
    if (currentTag !== "") {
      var regex = new RegExp("\{\{" + currentTag + "\}\}", 'g');
      if (tagValue !== "") {
        var matches = regex.exec(template);
        if (matches) {
          if (isNaN(tagValue)) {
            // Note that we have to run the code-formatting function for each individual
            // tag because if we tried to replace the tags first, and then run
            // `wrapBackticksInCodeTags` on the whole `template` at the end of this
            // function, if there was a stray backtick somewhere it would cause a major
            // HTML error since the <code> tags would be overlapping other HTML tags.
            template = template.replace(regex, wrapBackticksInCodeTags(tagValue));
          } else {
            var floatValue = parseFloat(tagValue);
            if (floatValue % 1 != 0) {
              floatValue = floatValue.toFixed(2);
            }
            template = template.replace(regex, floatValue.toString());
          }
        }
      } else {
        template = template.replace(regex, "n/a");
      }
    }
  }

  // Wrap backticks in <code> tags for monospaced formatting
  return template;
}

function populateSectionHeaders(str) {
  var headerFront = '<center><table cellpadding="0" cellspacing="0" border="0" height="36" width="100%">';
  headerFront += '<tr><td background="cid:headerImage" bgcolor="#7bceeb" valign="top"><!--[if gte mso 9]>';
  headerFront += '<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="mso-width-percent:1000;height:36px;">';
  headerFront += '<v:fill type="tile" src="cid:headerImage" color="#7bceeb" /><v:textbox inset="0,0,0,0"><![endif]--><div>';
  headerFront += '<table height="4"></table><center><span style="color: white; font-size: 21px; font-family: Avenir,Century Gothic,Montserrat,Segoe UI,Roboto,sans-serif;">';
  headerFront += '<b style="letter-spacing: 1px; -webkit-font-smoothing: antialiased; font-weight: 500;">';

  var headerBack = '</b></span></center></div><!--[if gte mso 9]></v:textbox></v:rect><![endif]--></td></tr></table></center>';

  var regex = new RegExp("\{\#(.+)\#\}");
  var match = regex.exec(str);

  while (match) {
    var tagged = match[0];
    var content = match[1];

    var header = headerFront + "&nbsp;" + content + "&nbsp;" + headerBack;

    str = str.replace(tagged, header);
    match = regex.exec(str);
  }
  return str;
}

function wrapBackticksInCodeTags(str) {
  var regex = new RegExp("`([^`]*)`");
  var match = regex.exec(str);

  while (match) {
    var quoted = match[0];
    var content = match[1];

    str = str.replace(quoted, "<code style='font-size: 13px;'>" + content.replace(/ /g, '\u00a0') + "</code>");
    match = regex.exec(str);
  }
  return str;
}
