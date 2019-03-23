#!/bin/bash

# Expects list of student logins on stdin. Creates student directories for each
# student such that they are the only student able to enter that directory.
#
# Written by: zespirit
# Last modified on 02/20/2019

# MODIFY: The directory to make the student directories in.
BASE_DIR="/course/cs1660/student"

# Usage: make_student_dir <login>
make_student_dir() {
	STUDENT_DIR="$BASE_DIR/$1"

    if [ -d $STUDENT_DIR ]; then
        echo "WARNING: $1 already had a directory; skipping..."
    else
        mkdir $STUDENT_DIR
        chmod ug=rwx,o= $STUDENT_DIR
        setfacl -m "u:$1:rx" $STUDENT_DIR
    fi
}

# Check that the /student directory exists:
if [ ! -d $BASE_DIR ]; then
    echo "ERROR: The $BASE_DIR directory doesn't exist. Create the directory manually first."
    exit 1
fi

# Create the directories for each student login, as read in from STDIN:
while read LOGIN; do
    echo "Creating directory for $LOGIN..."
    make_student_dir $LOGIN
done

echo "Complete!"
