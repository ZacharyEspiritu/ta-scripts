#!/bin/bash

# Prints out a list of each student (by login) that handed in a particular
# assignment as well as the number of days handed in past the specified
# due date.
#
# The output is in comma-separated format, as in the following example:
#
#   studentA,1
#   studentB,2
#   studentC,0
#   studentD,0
#   studentE,1
#   ...
#
# If you want to support a "grace period" of some kind, modify the
# MINUTE_DUE_DATE variable. By default, it is set to 12:00 AM, which means that
# any handins handed in at or after 12:00 AM the day following the due date
# will be marked as 1 day late. (For example, you could set the MINUTE_DUE_DATE
# variable to 12:15 AM to allow for handins to be submitted up to 15 minutes
# late without any late day penalty.)
#
# Written by: zespirit
# Last modified on 04/22/2019

# MODIFY: Hour and minute of due date (see description above):
MINUTE_DUE_DATE="12:00 AM"

# Constant for seconds per day:
SECONDS_PER_DAY=86400

# Usage: get_handins <handin-directory>
get_handins() {
    cd $1 || return
    find -maxdepth 1 -name '*.tgz' -print | sort -R
}

# Check for proper command line arguments:
if [ $# -ne 2 ]; then
  echo "Usage: $0 <assignment-name> <due-date>"
  exit 1
fi
ASSIGNMENT_NAME=$1
DAY_DUE_DATE=$2

# Calculate the UNIX timestamp corresponding to when the due date is:
DUE_DATE_TIMESTAMP=`date --date="$DAY_DUE_DATE $MINUTE_DUE_DATE" +%s`

# Get all of the handins:
ASSIGNMENT_HANDIN_DIR="/course/cs1660/handin/$ASSIGNMENT_NAME"
HANDIN_TARS=$(get_handins $ASSIGNMENT_HANDIN_DIR | sort)

# Loop over all of the handins and print out the student login with the
# number of days handed in past the specified due date:
for TAR_NAME in $HANDIN_TARS; do
    STUDENT_LOGIN=$(basename "$TAR_NAME" .tgz)
    FULL_TAR_PATH="$ASSIGNMENT_HANDIN_DIR/$STUDENT_LOGIN.tgz"

    # Get the time that the handin was handed in:
    HANDIN_TIMESTAMP=`stat -c %Y "$FULL_TAR_PATH"`

    # Get the difference between the handin time and the due date time:
    TIME_DIFF=$(( (HANDIN_TIMESTAMP - DUE_DATE_TIMESTAMP) / SECONDS_PER_DAY ))
    if [ $TIME_DIFF -lt 0 ]; then
        TIME_DIFF=0
    fi

    # Print it out to stdout:
    echo "$STUDENT_LOGIN,$TIME_DIFF"
done
