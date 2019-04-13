#!/bin/bash

# Compares two columns of two different (or perhaps, the same) CSVs; returns
# all lines in the right CSV's column that are not in the left CSV's column.
#
# You might find this script helpful for form-related checks such as "who
# didn't fill out a form?" or "who didn't hand in?". (This is essentially
# a more generalized version of the 'xor-student-lists.sh' script.)
#
# Author: zespirit
# Last modified: 04/13/2019

# Parse command-line arguments:
PARAMS=""
while (( "$#" )); do
    case "$1" in
        -h|--help)
	    echo "Returns all values in the specified column in the 'right' CSV that"
	    echo "are not in the specified column in the 'left' CSV."
            echo "Usage: $0 [--left-csv <name>] [--right-csv <name>] "
	    echo "          [--left-col <num>] [--right-col <num>]"
	    echo "Flags:"
	    echo "  [-l | --left-csv]:   The CSV on the 'left'."
	    echo "  [-r | --right-csv]:  The CSV on the 'right'."
	    echo "  [-lc | --left-col]:  The column number in the CSV on the 'left' to compare."
	    echo "  [-rc | --right-col]: The column number in the CSV on the 'left' to compare."
            exit 0
            ;;
        -l|--left-csv)
            LEFT_CSV_PATH=$2
            shift 2
            ;;
        -r|--right-csv)
            RIGHT_CSV_PATH=$2
            shift 2
            ;;
        -lc|--left-col)
            LEFT_CSV_COLUMN=$2
            shift 2
            ;;
        -rc|--right-col)
            RIGHT_CSV_COLUMN=$2
            shift 2
            ;;
        -v|--verbose)
            VERBOSE="true"
            shift 1
            ;;
        --) # end argument parsing
            shift
            break
            ;;
        -*|--*=) # unsupported flags
            echo "Error: Unsupported flag $1" >&2
            exit 1
            ;;
        *) # preserve positional arguments
            PARAMS="$PARAMS $1"
            shift
            ;;
    esac
done

# Validate command-line arguments:
if [ -z "$LEFT_CSV_PATH" ]; then
	echo "Error: Left CSV not specified. Run the command with the --help" >&2
	echo "flag for more information." >&2
	exit 1
fi
if [ -z "$RIGHT_CSV_PATH" ]; then
	echo "Error: Right CSV not specified. Run the command with the --help" >&2
	echo "flag for more information." >&2
	exit 1
fi
if [ -z "$LEFT_CSV_COLUMN" ]; then
	echo "Error: Left column number not specified. Run the command with the" >&2
	echo "--help flag for more information." >&2
	exit 1
fi
if [ -z "$RIGHT_CSV_COLUMN" ]; then
	echo "Error: Right column number not specified. Run the command with the" >&2
	echo "--help flag for more information." >&2
	exit 1
fi
if [ ! -f "$LEFT_CSV_PATH" ]; then
	echo "Error: $LEFT_CSV_PATH does not exist." >&2
	exit 1
fi
if [ ! -f "$RIGHT_CSV_PATH" ]; then
	echo "Error: $RIGHT_CSV_PATH does not exist." >&2
	exit 1
fi

# Diff the two columns in the two CSVs:
diff --new-line-format="" --unchanged-line-format="" \
  <(cut -d, -f$LEFT_CSV_COLUMN "$LEFT_CSV_PATH" | sort | uniq) \
  <(cut -d, -f$RIGHT_CSV_COLUMN "$RIGHT_CSV_PATH" | sort | uniq)
