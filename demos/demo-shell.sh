#!/bin/bash

# Creates a "demo shell" for use in demonstrations.
#
# The shell used here is /bin/bash.
#
# This can be helpful if you want to obfuscate the shell's usual display of the
# current working directory during a presentation, or just so the prompt looks
# more professional for demonstration purposes.
#
# Written by: zespirit
# Last modified on 03/23/2019

# Check that we're not already inside of a demo shell:
if [ -n "$__IN_DEMO_SHELL__" ]; then
    echo "Error: Already inside of the a shell. Close the demo shell using the" >&2
    echo "'exit' command before opening a new shell." >&2
    exit 1
fi
export __IN_DEMO_SHELL__="true"

# Note: The /bin/bash path needs to be on the same line as the last assignment
# to PROMPT_COMMAND in order for the PROMPT_COMMAND variable to be imported
# into the shell.
PROMPT_COMMAND='PS1="\[$(tput setaf 6)\]\[$(tput bold)\][demo] '
PROMPT_COMMAND+='\[$(tput sgr0)\]\[$(tput setaf 7)\]$ \[$(tput '
PROMPT_COMMAND+='sgr0)\]"; unset PROMPT_COMMAND;' /bin/bash
