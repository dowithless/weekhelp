#!/bin/sh

line=$(grep -n -m 1 -w -F "## weekhelp-test" "C:\Users\GC\weekhelp\01.md" | cut -d ":" -f 1)
echo "$line"
