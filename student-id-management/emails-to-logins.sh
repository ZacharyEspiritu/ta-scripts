#!/bin/bash

# Consumes a list of @brown.edu emails from STDIN (each email should be separated
# by a newline). Returns the corresponding CS logins for each of those email 
# addresses.
#
# Author: zespirit
# Last modified: 03/22/2019

while read STUDENT_EMAIL; do
    local STUDENT_LOGIN=$(ldapsearch mail="$STUDENT_EMAIL" -Q | \
                          grep "cn: " | \
                          cut -f2 -d " ")
    echo $STUDENT_LOGIN
done
