#!/usr/bin/python

# Expects list of student logins on STDIN. Generates a list of random,
# human-readable passwords where the list is formatted as:
#
#   cs_login password
#
# and each password is a three-word fragment. Examples of passwords include
# 'fantastic-acoustic-whale' and 'ambitious-turaco-of-joviality', as taken from
# the `coolname` package documentation.
#
# Make sure to install the `coolname` Python package by running the following
# command (the --user flag allows you to install the package without root
# privileges):
#
#   pip install coolname --user
#
# Written by: zespirit
# Last modified on 07/31/2019

from coolname import generate_slug
import sys

# Generate a password for each CS login passed via STDIN:
for username in sys.stdin:
    cleaned_login      = username.rstrip("\n")
    generated_password = generate_slug(3)
    print cleaned_login + " " + generated_password
