#!/bin/bash

# Consumes a file containing CS logins; returns all logins that are in the
# STUDENT_GROUP course group but NOT in the supplied <login-list-file>.
#
# You might find this script helpful for form-related checks such as "who
# didn't fill out a form?" or "who didn't hand in?".
#
# The "xor" moniker comes from the concept that we want to find everyone in
# one of the lists, but not the other---though admittedly it's a little
# misleading since a login in <login-list-file> that is not in STUDENT_GROUP
# will not be printed. Nevertheless, most common use cases will only care
# about students who are currently enrolled in the course; you can also
# modify the `diff` command below to change the script for your needs.
#
# Author: zespirit
# Last modified: 02/17/2019

# MODIFY: The course group to compare the student list again.
STUDENT_GROUP="cs-1660student"

if [ $# -ne 1 ]; then
  echo "Usage: $0 <login-list-file>"
  echo "Consumes a file consisting of student logins; returns all logins that"
  echo "are in the $STUDENT_GROUP course group but not in the supplied"
  echo "<login-list-file>."
  exit 1
fi

STUDENT_FILE=$1

diff --new-line-format="" --unchanged-line-format="" \
  <(members "$STUDENT_GROUP" | tr " " "\n" | sort | uniq) \
  <(cat "$STUDENT_FILE" | sort | uniq)
