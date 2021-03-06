# student-id-management

This script contains scripts relevant to the management of student identifiers (email addresses, CS logins, Banner IDs, etc.). Note that this category doesn't include anonymization of students (which is more relevant in a grading-related topic).

### Scripts

* [emails-to-logins.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/student-id-management/emails-to-logins.sh) - Consumes a list of @brown.edu email addresses and returns the associated CS logins.
* [logins-to-emails.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/student-id-management/logins-to-emails.sh) - Consumes a list of CS logins and returns the associated @brown.edu email addresses.
* [xor-student-lists.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/student-id-management/xor-student-lists.sh) - Consumes a file containing CS logins; returns all logins that are in the `cs-XXXXstudent` UNIX group but NOT in the supplied file. Helpful for figuring out which students (or TAs?) didn't fill out a form, didn't hand in an assignment, etc.
* [compare-csv-columns.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/student-id-management/compare-csv-columns.sh) - A more generalized version of [xor-student-lists.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/student-id-management/xor-student-lists.sh). Consumes two different CSVs (or perhaps the same CSV) and column numbers to compare in each of the CSVs, and returns all lines in the second CSV's column that are not in the first CSV's column. Helpful for checking who responded to a form by matching email addresses, CS logins, Banner IDs, etc., or any other case where you just want to check what values in one CSV's column are not found in another CSV's column.
