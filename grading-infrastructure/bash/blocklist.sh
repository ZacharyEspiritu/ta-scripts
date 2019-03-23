#!/bin/bash

# Adds a student to your blocklist.
#
# Written by: zespirit
# Last modified on 03/23/2019

STUDENT_GROUP="cs-1660student"
TA_LOGIN=$(whoami)
BLOCKLIST_DIRECTORY="/course/cs1660/admin/grading/blocklists"

# Error check command-line arguments:
if [ $# -ne 1 ]; then
    echo "Usage: $0 <login>" >&2
    exit 1
fi
STUDENT_TO_BLOCKLIST=$1

# Make sure we don't create world-readable files:
umask 007

# If it doesn't exist, create a blocklist file:
BLOCKLIST_FILE="$BLOCKLIST_DIRECTORY/$TA_LOGIN"
if [ ! -f "$BLOCKLIST_FILE" ]; then
    touch "$BLOCKLIST_FILE"
    chmod ug=rw,o= "$BLOCKLIST_FILE"
fi

# Make sure the student is in the course group:
if [ -z $(members "$STUDENT_GROUP" | \
          tr " " "\n" | \
          grep -w "$STUDENT_TO_BLOCKLIST") ]; then
    echo "Error: $STUDENT_TO_BLOCKLIST is not a member of $STUDENT_GROUP." >&2
    exit 1
fi

# Make sure we haven't put this student on the blocklist before to avoid
# duplicates:
if [ -z $(grep "$STUDENT_TO_BLOCKLIST" "$BLOCKLIST_FILE") ]; then
    echo $STUDENT_TO_BLOCKLIST >> "$BLOCKLIST_FILE"
    echo "Blocklisted $STUDENT_TO_BLOCKLIST."
else
    echo "Error: $STUDENT_TO_BLOCKLIST was already on your blocklist." >&2
    exit 1
fi
