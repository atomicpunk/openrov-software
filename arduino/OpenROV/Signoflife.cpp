#include "AConfig.h"
#if(HAS_STD_SIGNOFLIFE)
#include "Device.h"
#include "Pin.h"
#include "Signoflife.h"
#include "Timer.h"
#include <Arduino.h>

Pin signoflife("signoflife", SIGNOFLIFE_PIN, signoflife.analog, signoflife.out);
Timer lifetimer;
boolean lifeled = false;

void Signoflife::device_setup(){
	lifeled = true;
	lifetimer.reset();
	signoflife.reset();
	signoflife.write(255);
}

void Signoflife::device_loop(Command command){
	if( command.cmp("signoflife")){
		int value = command.args[1];
		signoflife.write(value);
	}
	if (lifetimer.elapsed (1000)) {
		lifeled = !lifeled;
		signoflife.write((lifeled)?255:0);
	}
}
#endif
