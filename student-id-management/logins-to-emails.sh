#!/bin/bash

# Consumes a list of CS logins from STDIN (each login should be separated by
# a newline). Returns the corresponding @brown.edu email addresses for each 
# of those logins.
#
# Author: zespirit
# Last modified: 03/22/2019

while read STUDENT_LOGIN; do
    local STUDENT_EMAIL=$(ldapsearch name="$STUDENT_LOGIN" -Q | \
                          grep "mail: " | \
                          cut -f2 -d " ")
    echo $STUDENT_EMAIL
done
