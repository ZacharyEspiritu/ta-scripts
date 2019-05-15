/** 
 * README:
 * - Set the PARENT_ID to the id of the folder the form/sheet resides, found by sharing the parent folder
 * - Set the SHEET_URL to the url of the form response sheet
 * - Set the STUDENT_KEYS to the url of the keys spreadsheet
 * - Set the ASSIGNMENT to the name of the current assignment
 * - Set the NUMBER_OF_DUPLICATES to the number of submissions to grade multiple times to help ensure grading consistency
 * - Run the harvest() function when all submissions are turned in to deposit student files into anonymised folders.
*/

var PARENT_ID = "1NDtmpUpN5mEENA80vhJ56IJJffYm3daV"
var SHEET_URL = "https://docs.google.com/spreadsheets/d/1Rx2y61ZWbiwWJczYJ7VaMr1cQntcJ_sv2oZlJiV517w/edit#gid=0"
var STUDENT_KEYS = "https://docs.google.com/spreadsheets/d/1dbADa9ZXiHyOZw1wYW4a1UiSDzO8vklxEFgcdCN-4oI/edit#gid=0"
var ASSIGNMENT = "Handins"
var keySet = {}
var DUPLICATE_STUDENT_MAPPING_SHEET_NAME = "Duplicate Mappings"
var STUDENT_MAPPING_SHEET_NAME = "Mappings"
var NUMBER_OF_DUPLICATES = 0;
var ID_STARTING_NUMBER = 1;

function getKeys() {
  var sheet = SpreadsheetApp.openByUrl(STUDENT_KEYS).getSheets()[0]
  var data = sheet.getDataRange().getValues()
  for (i = 1; i < data.length; i++) {
    if (data[i][0] in keySet) {
      keySet[data[i][0]].push(data[i][1])
    }
    else {
      keySet[data[i][0]] = [data[i][1]]
    }
    
  }
}

/**

Assigns each student an anonymised ID, then creates a subdirectory within ASSIGNMENT
for each anonymised submission, containing copies of the submitted files
which are renamed to the Respective question in the spreadsheet.

*/

function harvest() {
  var submissionDirectory = DriveApp.getFolderById(PARENT_ID).createFolder(ASSIGNMENT)
  //assignMappings()
  getKeys()
  Logger.log(keySet)
  var sheet = SpreadsheetApp.openByUrl(SHEET_URL)
  var data = sheet.getDataRange().getValues()
  for (i = data.length - 1; i > 0; i--) {
    timestamp = data[i][0]
    email = data[i][1]
    files = data[i].slice(2)
    ids = keySet[email] 
    
    // This for loop is to create the duplicate folders for when we duplicate grade 
    // a random subset of students to ensure grading accuracy
    for (id_index = 0; id_index < ids.length; id_index++) {
      id = ids[id_index]
      
      if (!submissionDirectory.getFoldersByName(id).hasNext()) {    
        var newFolder = DriveApp.createFolder(id)
        submissionDirectory.addFolder(newFolder)
        DriveApp.getRootFolder().removeFolder(newFolder)
        for (j = 0; j < files.length; j++) {
          id = files[j].split("?id=")[1]
          DriveApp.getFileById(id).makeCopy(data[0][j+2], newFolder)
        }
      }
    }
  }
  Logger.log("called")
}

// Fetched from https://stackoverflow.com/a/6274398

function shuffle(array) {
  var counter = array.length;
  
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    var index = Math.floor(Math.random() * counter);
    
    // Decrease counter by 1
    counter--;
    
    // And swap the last element with it
    var temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  
  return array;
}

var columnName = "Email Address"
var mappingSheetName = "Mappings"

var studentDict = [];
var counter = 0;
//The sheet id for:
//https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 is "abc1234567".

function assignMappings() {
  var sheet = SpreadsheetApp.openByUrl(SHEET_URL);
  var mapping = SpreadsheetApp.openByUrl(STUDENT_KEYS).insertSheet(0);
  var dups = SpreadsheetApp.openByUrl(STUDENT_KEYS).insertSheet(1);
  var data = sheet.getDataRange().getValues();
  var col = data[0].indexOf(columnName);
  var lastRow = sheet.getLastRow();
  var studentList = [];
  var dupEmails = [];
  // Clears the keys sheet before inserting new ones
  mapping.getDataRange().clear()
  mapping.setName(STUDENT_MAPPING_SHEET_NAME)
  dups.getDataRange().clear()
  dups.setName(DUPLICATE_STUDENT_MAPPING_SHEET_NAME)
  if (col != -1) {
    for(var row = 1; row < lastRow; row++){
      var dup = false;
      var entry = data[row][col];
      for(i in studentList){
        if(studentList[i] == entry){
          dup = true;
        }
      }
      if(!dup){
        studentList.push(entry);
      }
    }
    studentList = shuffle(studentList)
    for(var i = 0; i < NUMBER_OF_DUPLICATES; i++){
      dupEmails.push(studentList[i])
      studentList.push(studentList[i])
    }
    studentList = shuffle(studentList)
    mapping.appendRow(["Email Address", "Key"])
    dups.appendRow(["Email Address", "Key"])
    for(var i = 0; i < studentList.length; i++){
      var member = false
      for(var j = 0; j < dupEmails.length; j++){
        if(studentList[i] == dupEmails[j]){
          member = true
          break
        }
      }
      if(member){
        dups.appendRow([studentList[i], i + ID_STARTING_NUMBER]);
      }
      mapping.appendRow([studentList[i], i + ID_STARTING_NUMBER]);
    }
    return true;
  }
  throw "No column named " + columnName;
}
