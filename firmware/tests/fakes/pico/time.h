#pragma once
#include "Arduino.h"
struct repeating_timer_t {};
inline unsigned timerStarts, timerStops;
inline bool cancel_repeating_timer(repeating_timer_t *) {++timerStops;return true;}
inline bool add_repeating_timer_us(int,bool (*)(repeating_timer_t *),void *,repeating_timer_t *) {++timerStarts;return true;}
inline uint32_t time_us_32(){return fakeNow*1000u+fakeMicros;}
