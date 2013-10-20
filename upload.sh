#!/bin/sh

if [ $# -lt 1 ]; then
	echo "USAGE: upload.sh <hexfile>"
	exit
fi

avrdude -P /dev/spidev1.0 -c linuxspi -vv -p m2560 -U flash:w:$1
