#!/bin/bash

# MODIFY: Course-specific directories.
STUDENT_GROUP="cs-1660student"
HANDIN_DIRECTORY="/course/cs1660/handin"

# Error check command-line arguments:
if [ $# -ne 2 ]; then
    echo "Usage: $0 <assignment-name> <student-login>"
    exit 1
fi
ASSIGNMENT_NAME=$1
STUDENT_LOGIN=$2

# Check a valid assignment name was specified:
ASSIGNMENT_DIRECTORY="$HANDIN_DIRECTORY/$ASSIGNMENT_NAME"
if [ ! -d "$ASSIGNMENT_DIRECTORY" ]; then
    echo "Error: $ASSIGNMENT_NAME is not a valid assignment."
    exit
fi

# Check student is in the course group:
if [ -z $(members "$STUDENT_GROUP" | \
          tr " " "\n" | \
          grep -w "$STUDENT_LOGIN") ]; then
    echo "Error: $STUDENT_LOGIN is not a member of $STUDENT_GROUP." >&2
    exit 1
fi

# Check if a handin exists for the given student:
HANDIN_FILE="$ASSIGNMENT_DIRECTORY/$STUDENT_LOGIN.tgz"
if [ -f "$HANDIN_FILE" ]; then
    HANDIN_TIMESTAMP=$(stat -c %y "$HANDIN_FILE")
    echo "$STUDENT_LOGIN has a recorded handin for $ASSIGNMENT_NAME, submitted"
    echo "at $HANDIN_TIMESTAMP."
else
    echo "$STUDENT_LOGIN does not have a recorded handin for $ASSIGNMENT_NAME."
fi
