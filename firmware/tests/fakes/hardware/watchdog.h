#pragma once
inline unsigned watchdogReloads;
inline void watchdog_enable(unsigned,bool) {}
inline void watchdog_update() {++watchdogReloads;}
