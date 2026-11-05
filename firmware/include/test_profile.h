#pragma once
// 0: normal diagnostics image; 1: stationary bus test; 2: bounded unloaded test.
// Build profiles 1/2 only through build-firmware.mjs with an operator record.
#ifndef PD1180_TEST_PROFILE
#define PD1180_TEST_PROFILE 0
#endif
#if PD1180_TEST_PROFILE < 0 || PD1180_TEST_PROFILE > 2
#error Invalid commissioning profile
#endif
#if PD1180_TEST_PROFILE != 0
#ifndef PD1180_TEST_RECORD_SHA
#error A commissioning record hash is required
#endif
static_assert(sizeof(PD1180_TEST_RECORD_SHA) == 65, "Expected record SHA-256");
#endif
#define PD1180_BENCH_RUN_MS 10000u
#define PD1180_BENCH_STOP_MS 1500u
