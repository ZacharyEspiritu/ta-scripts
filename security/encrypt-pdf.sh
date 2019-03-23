#!/bin/bash

# Encrypts a PDF <input> to a new file <output> with a supplied password. The
# password must be supplied when the new file is opened; otherwise, programs
# will be unable to open the new file.
#
# This is helpful for encrypting solution PDFs, which is helpful to keep
# solutions somewhat more secure. Note that the security of your solutions
# depends on where you post your solution passwords (for example, a Piazza
# post or a world-readable file on the department filesystem is a bad idea
# since anyone can sign up for Piazza / read the contents of the file).
#
# Some ideas for good places to post passwords are:
# 
#   1) A file in your /course/csXXXX/pub directory set to the cs-XXXXstudent
#      group with group-readable permissions and no world permissions.
#
#   2) Emails sent to the course student listserv.
#
# At this point, your security relies on the strength of your collaboration
# policy. (But probably the most important thing with solution encryption is 
# to avoid having sensitive documents archived to the Wayback Machine, etc.)
#
# Written by: zespirit
# Last modified on 03/23/2019

# Error check command-line arguments:
if [ $# -ne 3 ]; then
	echo "Usage: $0 <input> <output> <password>" >&2
	exit 1
fi

# Encrypt the PDF:
/usr/bin/pdftk "$1" output "$2" user_pw "$3"
