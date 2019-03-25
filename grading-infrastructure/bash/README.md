# bash

Various Bash scripts that are helpful for grading purposes.

Most of the scripts here are helpful in the actual _grading process_---that is, when TAs are extracting handins from the `/course/csXXXX/handin` directory and grading them. You'll need an additional system for actually recording grades and emailing out reports. For example, CSCI1660 used these scripts for their grading processes, then used the Google Apps Script scripts ([found here](https://github.com/ZacharyEspiritu/ta-scripts/tree/master/grading-infrastructure/google-apps-script)) to distribute grades.

### Scripts

* [blocklist.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/grading-infrastructure/bash/blocklist.sh) - Adds a student to a blocklist file.
* [check-if-handin-exists.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/grading-infrastructure/bash/check-if-handin-exists.sh) - Checks if a particular student handed in an assignment. Useful for interactive gradings, or when students ask whether or not their handin was recorded successfully.
* [extract-handin.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/grading-infrastructure/bash/extract-handin.sh) - Extracts a student's handin for a particular assignment to a directory of choice. Useful for checking if a student handed in the right files for a one-time occurrence, or perhaps to be used in a larger script.
* [grade-handin.sh](https://github.com/ZacharyEspiritu/ta-scripts/blob/master/grading-infrastructure/bash/grade-handin.sh) - The script that does it all. Extracts a random student's handin for a specified assignment found in the `/course/csXXXX/handin` directory (accounts for race conditions between multiple graders grading at the same time as well as per-TA blocklists), assigns an anonymous identifier to that student, adds it to a file in a specified `ALLOCATIONS_DIRECTORY`, then launches a "grading shell" in which the TA can grade.
