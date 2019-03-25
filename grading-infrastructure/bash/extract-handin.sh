#!/bin/bash

# Extracts a student's handin for a given assignment.
#
# Helpful for a one-time check for a student, or perhaps to be used in a larger
# script.
#
# Written by zespirit on 03/25/19
# Last modified on 03/25/19

# MODIFY: Course-specific directories.
HANDIN_DIRECTORY="/course/cs1660/handin"

# Usage: usage
usage() {
  echo "Usage: $0 [--assignment <name>] [--student <login>] [--output <folder-path>]"
  echo "Available flags:"
  echo "  [-h, --help]:              print this help message"
  echo "  [-a, --assignment] <name>: name of the assignment"
  echo "  [-s, --student] <login>:   login of the student's handin to extract"
  echo "  [-o, --output] <path>:     path of destination folder to extract to"
}

# Parse command-line flags:
PARAMS=""
while (( "$#" )); do
  case "$1" in
    -h|--help)
        usage
        exit 0
        ;;
    -a|--assignment)
        ASSIGNMENT_NAME=$2
        shift 2
        ;;
    -s|--student)
        STUDENT_LOGIN=$2
        shift 2
        ;;
    -o|--output)
        DESTINATION_PATH=$2
        shift 2
        ;;
    --) # end argument parsing
        shift
        break
        ;;
    -*|--*=) # unsupported flags
        echo "Error: Unsupported flag $1. Run $0 --help for more information." >&2
        exit 1
        ;;
    *) # preserve positional arguments
        PARAMS="$PARAMS $1"
        shift
        ;;
  esac
done

# Error-check arguments to script:
if [ -z "$ASSIGNMENT_NAME" ]; then
  echo "Error: Assignment name not specified." >&2
  exit 1
fi
if [ -z "$STUDENT_LOGIN" ]; then
  echo "Error: Student login not specified." >&2
  exit 1
fi

# Verify that the assignment is a real assignment:
ASGN_HANDIN_DIRECTORY="$HANDIN_DIRECTORY/$ASSIGNMENT_NAME"
if [ ! -d "$ASGN_HANDIN_DIRECTORY" ]; then
  echo "Error: $ASSIGNMENT_NAME is not a valid assignment." >&2
  exit 1
fi

# Check that the handin exists:
STUDENT_HANDIN_TAR="$ASGN_HANDIN_DIRECTORY/$STUDENT_LOGIN.tgz"
if [ ! -f "$STUDENT_HANDIN_TAR" ]; then
  echo "Error: Could not find handin from $STUDENT_LOGIN for $ASSIGNMENT_NAME." >&2
  exit 1
fi

# If DESTINATION_PATH specified, extract there (otherwise, place in current
# working directory):
if [ -z "$DESTINATION_PATH" ]; then
  DESTINATION_PATH="./$ASSIGNMENT_NAME-$STUDENT_LOGIN"
fi
mkdir "$DESTINATION_PATH" && tar -C "$DESTINATION_PATH" -xzf "$STUDENT_HANDIN_TAR"
