#pragma once
#include "Arduino.h"
struct repeating_timer_t {};
inline bool add_repeating_timer_us(int,bool (*)(repeating_timer_t *),void *,repeating_timer_t *) {return true;}
inline uint32_t time_us_32(){return fakeNow*1000u;}
