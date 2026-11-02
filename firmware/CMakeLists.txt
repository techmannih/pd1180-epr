cmake_minimum_required(VERSION 3.20)
project(pd1180_epr_firmware_logic C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

add_library(pd1180_control STATIC
  src/telemetry.c
  src/power_domain.c
  src/brake_preflight.c
  src/control.c
  src/pd_contract.c
  src/drv8462.c
  src/step_motion.c
  src/as5600.c
)
target_include_directories(pd1180_control PUBLIC include)
target_compile_options(pd1180_control PRIVATE -Wall -Wextra -Werror -Wpedantic)

add_executable(pd1180_firmware_sim src/main.c)
target_link_libraries(pd1180_firmware_sim PRIVATE pd1180_control)
target_compile_options(pd1180_firmware_sim PRIVATE -Wall -Wextra -Werror -Wpedantic)

enable_testing()
add_executable(control_tests tests/test_control.c)
target_link_libraries(control_tests PRIVATE pd1180_control)
target_compile_options(control_tests PRIVATE -Wall -Wextra -Werror -Wpedantic)
add_test(NAME control_tests COMMAND control_tests)

add_executable(brake_preflight_tests tests/test_brake_preflight.c)
target_link_libraries(brake_preflight_tests PRIVATE pd1180_control)
add_test(NAME brake_preflight_tests COMMAND brake_preflight_tests)

add_executable(rp2040_driver_tests tests/test_rp2040_driver.c)
target_link_libraries(rp2040_driver_tests PRIVATE pd1180_control)
add_test(NAME rp2040_driver_tests COMMAND rp2040_driver_tests)
