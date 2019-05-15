/**
 * Allocates anonymized handins to TAs with respect to blocklists.
 *
 * Usage: 
 *   1. Check that BLOCKLIST_SPREADSHEET_URL points to the TA Blocklists sheet.
 *   2. Replace ANONYMIZED_MAPPINGS_SPREADSHEET_URL with a url that points to the anonymized 
 *      mappings spreadsheet for the current assignment. Make sure DUPLICATED_HANDINS_SHEET_NAME 
 *      is set to the name of the sheet that maps handins that have been duplicated across 
 *      different IDs.
 *   3. Run the `allocateHandins` function by selecting it in the above dropdown and pressing the 
 *      Run button. A sheet will be added to the spreadsheet at ANONYMIZED_MAPPINGS_SPREADSHEET_URL
 *      titled "Allocations", which contains the IDs allocated to each TA.
 *
 * Last modified: zespirit on 07/01/18
 */

var BLOCKLIST_SPREADSHEET_URL = "REPLACEME";
// BLOCKLIST_SPREADSHEET_URL contains each of the TA's blocklists.
//  - Column A should be the login of every TA. 
//  - Column B should have the emails of each blocklisted student separated by commas (no spaces).
//  - Column C should have the maximum number of handins to allocate to the TA on the same row. It
//     must be a non-negative integer. However, if a TA's column C contains '-1', it will assume
//     there is no limit to the number of handins that can be allocated to that TA.

var ANONYMIZED_MAPPINGS_SPREADSHEET_URL = "REPLACEME";
var DUPLICATED_HANDINS_SHEET_NAME = "Duplicate Mappings";
// ANONYMIZED_MAPPINGS_SPREADSHEET_URL contains two sheets:
//  - "Mappings" must be the main, first sheet and contains two columns:
//    - Column A are the emails for each student
//    - Column B is the associated anonymous ID for the student on the same row
//  - DUPLICATED_HANDINS_SHEET_NAME contains all instances of handins that have been duplicated 
//    across different IDs and contains two columns:
//    - Column A are the emails for each student
//    - Column B is the associated anonymous ID for the student on the same row

function allocateHandins() {
  var taObjects  = parseBlocklistSpreadsheet(BLOCKLIST_SPREADSHEET_URL);
  
  var mappingsData  = getStudentIdsAndEmailsFromMappings(ANONYMIZED_MAPPINGS_SPREADSHEET_URL);
  var studentEmails = mappingsData.emails;
  var studentIds    = mappingsData.ids;
  
  var getStudentEmail = makeGetStudentEmailFunction(studentEmails, studentIds);
  
  var taLogins = extractTaLoginsFromObjects(taObjects);
  
  var unassignedIds = [];
  for (var i = 0; i < studentIds.length; i++) {
    var nextId = studentIds[i];
    if (!assignNextTa(nextId, taObjects, getStudentEmail)) {
      Logger.log("Unable to assign ID #" + nextId + " to any TA!");
      unassignedIds.push(nextId);
    }
  }
  
  var mappingsSpreadsheet = SpreadsheetApp.openByUrl(ANONYMIZED_MAPPINGS_SPREADSHEET_URL);
  var allocationsSheet    = mappingsSpreadsheet.insertSheet("Allocations");
  
  // Sort TA objects alphabetically by login:
  taObjects.sort(function (a,b) {
    if (a.login < b.login) return -1;
    if (a.login > b.login) return 1;
    return 0;
  });
  
  var dataToPush = [["TA Login", "Allocated IDs"]];
  for (var i = 0; i < taObjects.length; i++) {
    var taObject    = taObjects[i];
    var login       = taObject.login;
    var assignedIds = taObject.assignedIds;
    
    var row = [login, assignedIds.join(", ")];
    dataToPush.push(row);
  }
  
  var unassignedRow = ["No IDs unassigned!", null];
  if (unassignedIds.length > 0) {
    unassignedRow = ["Unassigned", unassignedIds.join(", ")]
  }
  dataToPush.push(unassignedRow);
  
  allocationsSheet.getRange("A1:B" + dataToPush.length).setValues(dataToPush);
}

function parseBlocklistSpreadsheet(spreadsheetUrl) {
  var blocklistSheet = SpreadsheetApp.openByUrl(spreadsheetUrl).getSheets()[0];
  var blocklistData  = blocklistSheet.getRange("A2:C1000").getValues();
  
  var blocklists = [];
  for (var i = 0; i < blocklistData.length; i++) {
    var row = blocklistData[i];
    
    // Verify that the row has a TA name in the first column. If it doesn't, assume 
    // that there are no other TAs following this row and break out of the loop:
    if (row[0] == "") {
      break;
    } 
    else {
      // Create a Javascript object representing a TA and their blocklist information:
      blocklists.push({
        login: row[0],
        blocklist: row[1].split(","),
        limit: row[2],
        assignedIds: []
      });
    }
  }
  return blocklists;
}

function getStudentIdsAndEmailsFromMappings(mappingsSpreadsheetUrl) {
  var mappingsSheet = SpreadsheetApp.openByUrl(mappingsSpreadsheetUrl).getSheets()[0];
  var mappingsData  = mappingsSheet.getRange("A2:B10000").getValues();
  
  var studentEmails = [];
  var studentIds    = [];
  for (var i = 0; i < mappingsData.length; i++) {
    var row   = mappingsData[i];
    var email = row[0];
    var id    = row[1];
    if (email == "" || id == "") {
      break;
    }
    else {
      studentEmails.push(email);
      studentIds.push(id);
    }
  }
  
  return {
    emails: studentEmails,
    ids: studentIds
  };
}

function makeGetStudentEmailFunction(studentEmails, studentIds) {
  var getStudentEmail = function(queryId) {
    for (var z = 0; z < studentIds.length; z++) {
      if (queryId == studentIds[z]) {
        return studentEmails[z];
      }
    }
    throw "Queried ID #" + queryID + " not found!";
  }
  return getStudentEmail;
}

function extractTaLoginsFromObjects(taObjects) {
  return taObjects.map(function (ta) { return ta.login; });
}

function assignNextTa(studentId, taObjects, getStudentEmail) {
  // Sort the TAs by number of assigned handins:
  taObjects.sort(function (a,b) { 
    return a.assignedIds.length - b.assignedIds.length; 
  });
  
  // Iterate over the sorted list of TAs:
  for (var i = 0; i < taObjects.length; i++) {
    var ta = taObjects[i];
    
    // Check if the TA has already reached their quota:
    if (isTaLimitReached(ta)) {
      Logger.log("Could not assign ID #" + studentId + " to " + ta.login + " because they reached quota.");
      continue;
    }
    
    // Check if student associated with the next studentId has been 
    // blocklisted by the TA:
    if (isIdBlocklistedByTa(ta, studentId, getStudentEmail)) {
      Logger.log("Could not assign ID #" + studentId + " to " + ta.login + " because they were on the TA's blocklist.");
      continue;
    }
    
    // Check if the student has already been assigned to this TA
    // under a different ID (accounting for duplicate handins):
    if (isTaGradingStudentUnderDifferentId(ta, studentId, getStudentEmail)) {
      Logger.log("Could not assign ID #" + studentId + " to " + ta.login + " because they were already being graded by the TA under a different ID.");
      continue;
    }
    
    // Assign studentId to this TA:
    ta.assignedIds.push(studentId);
    return true;
  }
  
  return false;
}

function isTaLimitReached(taObject) {
  var limit = taObject.limit;
  var assignedCount = taObject.assignedIds.length;
  // If limit == -1, that means the TA has no limit to the number of
  // handins that they can be allocated:
  return (limit != -1) && (assignedCount >= limit);
}

function isIdBlocklistedByTa(taObject, studentId, getStudentEmail) {
  return taObject.blocklist.indexOf(getStudentEmail(studentId)) > -1;
}

function isTaGradingStudentUnderDifferentId(taObject, newId, getStudentEmail) {
  for (var i = 0; i < taObject.assignedIds.length; i++) {
    var existingId = taObject.assignedIds[i];
    if (getStudentEmail(existingId) == getStudentEmail(newId)) {
      return true;
    }
  }
  return false;
}
