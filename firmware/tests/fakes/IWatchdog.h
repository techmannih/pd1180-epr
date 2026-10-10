#pragma once
struct FakeWatchdog {
  unsigned reloads=0;
  void begin(unsigned) {}
  void reload() { ++reloads; }
};
inline FakeWatchdog IWatchdog;
