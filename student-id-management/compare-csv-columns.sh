#!/bin/bash

# Author: zespirit
# Last modified: 04/12/2019

# Parse command-line arguments:
PARAMS=""
while (( "$#" )); do
    case "$1" in
        -h|--help)
            echo "$0 --left-csv <name> --right-csv <name> --left-col <num> --right-col <num>"
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

if [ -z "$LEFT_CSV_PATH" ]; then
	echo "ERROR: Left *.csv not specified." >&2
	exit 1
fi

if [ -z "$RIGHT_CSV_PATH" ]; then
	echo "ERROR: Left *.csv not specified." >&2
	exit 1
fi

if [ -z "$LEFT_CSV_COLUMN" ]; then
	echo "ERROR: Left column number not specified." >&2
	exit 1
fi

if [ -z "$RIGHT_CSV_COLUMN" ]; then
	echo "ERROR: Right column number not specified." >&2
	exit 1
fi

if [ ! -f "$LEFT_CSV_PATH" ]; then
	echo "ERROR: $LEFT_CSV_PATH does not exist." >&2
	exit 1
fi

if [ ! -f "$RIGHT_CSV_PATH" ]; then
	echo "ERROR: $RIGHT_CSV_PATH does not exist." >&2
	exit 1
fi

diff --new-line-format="" --unchanged-line-format="" \
  <(cut -d, -f$LEFT_CSV_COLUMN "$LEFT_CSV_PATH" | sort | uniq) \
  <(cut -d, -f$RIGHT_CSV_COLUMN "$RIGHT_CSV_PATH" | sort | uniq)
