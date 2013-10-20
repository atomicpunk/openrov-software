#!/bin/sh

/etc/init.d/openrov stop
/opt/openrov/linux/arduino/firmware-installfromsource.sh
/etc/init.d/openrov start
