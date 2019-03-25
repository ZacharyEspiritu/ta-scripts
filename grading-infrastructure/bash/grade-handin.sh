#!/bin/bash

# Anonymously extracts a student's assignment. 
# 
# Extracting a student's assignment will place you in a "grading shell", 
# which is, by default, just a fancy prompt that makes it obvious to 
# the grader that they're currently grading an assignment. Depending on 
# your course needs, you might customize the grading shell code to:
# 
#   1) act as a sandbox for code that could be potentially malicious
#   2) open programs automatically that would be helpful when grading
#   3) etc.
#
# Make sure to update the course-specific directories marked with the
# "MODIFY" keyword before using this for your own course.
#
# NOTES:
#
#  - Anonymous identifers are generated using the /contrib/bin/bashids
#    program with six alphanumeric characters. The alphabet of characters
#    that can be used as identifiers is "ABCDEFGHIJKLMNPQRSTUVWXYZ23456789"
#    (the letter "O" and the numbers "1" and "0" are omitted as they can be
#    easily confused with other letters).
#
#  - This script uses lockfiles that act as mutexes to ensure that no two 
#    graders extract the same handin. See the `exlock` and `unlock` function 
#    calls in the script to see how this is done.
#
# Usage: csXXXX-grade <assignment-name>
#        - <assignment-name> is the name of an assignment as found in
#          /course/csXXXX/handin/<assignment-name>
#
# Written by: zespirit (heavily based on the old `ksh` extraction script)
# Last modified on 03/24/2019

## HEADER
## The below lockfile code is attributed to `https://stackoverflow.com/a/
## 1985512/5099203`.

LOCKFILE="/var/lock/`basename $0`"
LOCKFD=99

# PRIVATE
_lock()             { flock -$1 $LOCKFD; }
_no_more_locking()  { _lock u; _lock xn && rm -f $LOCKFILE; }
_prepare_locking()  { eval "exec $LOCKFD>\"$LOCKFILE\""; trap _no_more_locking EXIT; }

# ON START
_prepare_locking

# PUBLIC
exlock_now()        { _lock xn; }  # obtain an exclusive lock immediately or fail
exlock()            { _lock x; }   # obtain an exclusive lock
shlock()            { _lock s; }   # obtain a shared lock
unlock()            { _lock u; }   # drop a lock

### BEGINNING OF SCRIPT ###

# MODIFY: Course-specific directories for the grading infrastructure.
COURSE_DIRECTORY="/course/cs1660"
HANDIN_DIRECTORY="$COURSE_DIRECTORY/handin"
GRADING_DIRECTORY="$COURSE_DIRECTORY/admin/grading"
BLOCKLISTS_DIRECTORY="$GRADING_DIRECTORY/blocklists"
ALLOCATIONS_DIRECTORY="$GRADING_DIRECTORY/allocations"

# Check if we're currently in the grading shell.
if [ "$IS_CURRENTLY_GRADING" == 1 ]; then
  echo "Currently in grading shell; please exit before trying to grade." >&2
  exit 1
fi
export IS_CURRENTLY_GRADING=1

# Default to 770 / 660 permissions.
umask 007

# Check for proper command line arguments:
if [ $# -ne 1 ]; then
  echo "Usage: $0 <assignment-name>"
  exit 1
fi
ASSIGNMENT_NAME=$1

# Get the current grader:
TA_LOGIN=$(whoami)

# Verify that the assignment is a real assignment:
ASGN_HANDIN_DIRECTORY="$HANDIN_DIRECTORY/$ASSIGNMENT_NAME"
if [ ! -d "$ASGN_HANDIN_DIRECTORY" ]; then
  echo "$ASSIGNMENT_NAME is not a valid assignment."
  exit 1
fi

# Get paths to important files:
BLOCKLIST_FILE="$BLOCKLISTS_DIRECTORY/$TA_LOGIN"
ALLOCATIONS_FILE="$ALLOCATIONS_DIRECTORY/$ASSIGNMENT_NAME.csv"
if [ ! -f "$ALLOCATIONS_FILE" ]; then
  touch "$ALLOCATIONS_FILE"
fi

# Usage: get_handins <handin-directory>
get_handins() {
  cd $1 || return
  find -maxdepth 1 -name '*.tgz' -print | sort -R
}

# Pick a student to grade:
exlock
BLOCKLISTED_COUNT=0
STUDENT_LOGIN=""
HANDIN_TARS=$(get_handins $ASGN_HANDIN_DIRECTORY)
echo "Finding student to grade..."
for TAR_NAME in $HANDIN_TARS; do
  # Extract the student login from the handin archive:
  local POSSIBLE_LOGIN=$(basename "$TAR_NAME" .tgz)

  # Check if the student is already being graded:
  if [ -f "$ALLOCATIONS_FILE" ]; then
    grep -q "^$POSSIBLE_LOGIN," "$ALLOCATIONS_FILE" > /dev/null 2&> /dev/null
    if [ $? -eq 0 ]; then
      continue
    fi
  fi

  # Check if the student has been blocklisted:
  if [ -f "$BLOCKLIST_FILE" ]; then
    fgrep -xq "$POSSIBLE_LOGIN" "$BLOCKLIST_FILE" > /dev/null 2&> /dev/null
    if [ $? -eq 0 ]; then
      let "BLOCKLISTED_COUNT += 1"
      continue
    fi
  fi

  # At this point, we can grade this student:
  STUDENT_LOGIN="$POSSIBLE_LOGIN"
  break
done

# Check that we found someone to grade:
if [ -z $STUDENT_LOGIN ]; then
  echo "No one left to grade for $ASSIGNMENT_NAME."
  if [ $BLOCKLISTED_COUNT -gt 0 ]; then
    echo "Note: $BLOCKLISTED_COUNT students were skipped because they were on your blocklist."
  fi
  exit 1
fi

# Find an existing UUID for the student (if it doesn't exist, generate a random
# UUID for the student):
echo "Finding anonymous ID for student..."
HANDIN_NUMBER=$(cat "$ALLOCATIONS_FILE" | wc -l)
ANONYMOUS_ID=$(grep -w "$STUDENT_LOGIN" "$ALLOCATIONS_FILE" | tail -n1 | cut -d',' -f2)
if [ -z "$ANONYMOUS_ID" ]; then
  ANONYMOUS_ID=$(/contrib/bin/bashids -e -l 6 \
                 -a ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789 \
                 -s "$ASSIGNMENT_NAME" $HANDIN_NUMBER)
  while [ ! -z `grep $ANONYMOUS_ID $ALLOCATIONS_FILE` ]; do
    let "HANDIN_NUMBER += 1"
    ANONYMOUS_ID=$(/contrib/bin/bashids -e -l 6 \
                   -a ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789 \
                   -s "$ASSIGNMENT_NAME" $HANDIN_NUMBER)
  done
  echo "$STUDENT_LOGIN,$ANONYMOUS_ID,$TA_LOGIN" >> "$ALLOCATIONS_FILE"
fi
unlock

# Extract the student's handin if it hasn't already been extracted
echo "Extracting handin for $ANONYMOUS_ID..."
EXTRACT_DIR="$GRADING_DIRECTORY/ta/$TA_LOGIN/$ASSIGNMENT_NAME/$ANONYMOUS_ID"
mkdir -p --mode=2770 "$EXTRACT_DIR"
tar -C "$EXTRACT_DIR" -xzf "$ASGN_HANDIN_DIRECTORY/$STUDENT_LOGIN.tgz"
chmod -R o-rwx,ug+rwX "$EXTRACT_DIR"

# Open the grading shell:
echo "Entering the grading shell...once you're done, please make sure to run"
echo "'exit' to leave the grading shell before grading another handin!"

cd "$EXTRACT_DIR"
PROMPT_COMMAND='PS1="\[$(tput bold)\]\[$(tput setaf 6)\]grading \[$(tput setaf 2)\]'
PROMPT_COMMAND+='[\[$(tput setaf 3)\]\u@\[$(tput setaf 3)\]\h \[$(tput setaf 6)\]\W'
PROMPT_COMMAND+='\[$(tput setaf 2)\]]\[$(tput setaf 4)\] \\$ \[$(tput sgr0)\]"; '
PROMPT_COMMAND+='unset PROMPT_COMMAND;' $SHELL

echo "Done grading $ANONYMOUS_ID! To get back to this handin, use the "
echo "'csXXXX-regrade' command."
