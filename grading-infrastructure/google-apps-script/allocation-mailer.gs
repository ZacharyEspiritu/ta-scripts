/**
* Mails out allocations to TAs.
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

var ASSIGNMENT_NAME = "24";

var ALLOCATION_SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1dbADa9ZXiHyOZw1wYW4a1UiSDzO8vklxEFgcdCN-4oI/edit#gid=1991398763";
var MAPPINGS_SHEET_NAME = "Mappings";
var DUPLICATES_SHEET_NAME = "Duplicate Mappings";
var ALLOCATION_SHEET_NAME = "Allocations";

function mailAllocations() {
  var allocationSpreadsheet = SpreadsheetApp.openByUrl(ALLOCATION_SPREADSHEET_URL);
  
  // Get number of total IDs:
  var mappingsSheet   = allocationSpreadsheet.getSheetByName(MAPPINGS_SHEET_NAME);
  var numberOfHandins = mappingsSheet.getLastRow() - 1;
  
  // Get number of duplicates (divided by 2, since one is the "real handin" and the
  // other is the "duplicate handin"):
  var duplicatesSheet    = allocationSpreadsheet.getSheetByName(DUPLICATES_SHEET_NAME);
  var numberOfDuplicates = Math.floor((duplicatesSheet.getLastRow() - 1) / 2);
  
  // Grab data from the allocation sheet:
  var allocationSheet = allocationSpreadsheet.getSheetByName(ALLOCATION_SHEET_NAME);
  var allocationData  = allocationSheet.getRange("A2:C1000").getValues();
  
  for (var i = 0; i < allocationData.length; i++) {
    var row = allocationData[i];
    var taLogin = row[0];
    var allocatedIds = row[1].split(", ");
    var brownEmail = row[2];
    if (taLogin == "") {
      break;
    }
    if (brownEmail == "" || row[1] == "" || allocatedIds.length <= 0) {
      continue; 
    }
    else {
      var emailSubject = "[CS0190] Grading Allocation for " + ASSIGNMENT_NAME;
      
      var emailBody = "Hi " + taLogin + ",<br><br>";
      
      emailBody += "Your final grading allocation for " + ASSIGNMENT_NAME + " can be found below!<br><br>";
      
      emailBody += "You were allocated " + allocatedIds.length + " handins out of a ";
      emailBody += "total " + numberOfHandins + " remaining handins. Note that " + numberOfDuplicates + " of the ";
      emailBody += "total number of handins have been assigned to other TAs under a ";
      emailBody += "different ID to check for grading consistency across TAs—you may or ";
      emailBody += "may not have been assigned one of these duplicated handins. (That's ";
      emailBody += "part of the fun!)<br><br>";
      
      emailBody += "Please contact the HTAs as soon as possible if you are no longer able ";
      emailBody += "to complete your grading allocation.<br><br>";
      
      emailBody += "<b>Allocated Handin IDs for " + ASSIGNMENT_NAME + ":</b>";
      
      emailBody += "<ul>";
      for (var j = 0; j < allocatedIds.length; j++) {
        var id = allocatedIds[j];
        emailBody += "<li>" + id + "</li>";
      }
      emailBody += "</ul>";
      
      emailBody += "Best,<br>";
      emailBody += "The CS19 HTAs";
      
      Logger.log(brownEmail);
      Logger.log(emailSubject);
      Logger.log(emailBody);
      
      MailApp.sendEmail(brownEmail, emailSubject, "", {
        name: "The CS19 HTAs",
        replyTo: "cs0190headtas@lists.brown.edu",
        htmlBody: emailBody
      });
    }
  }
}
