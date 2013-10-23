
#ifndef __SIGNOFLIFE_H_
#define __SIGNOFLIFE_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"
#include "AConfig.h"

#if(HAS_OROV_CONTROLLERBOARD_25)
  #include "controllerboard25.h"
#endif

class Signoflife : public Device {
  public:
    Signoflife():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
