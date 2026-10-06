cmake_minimum_required(VERSION 3.20)
project(pd1180_epr_firmware_logic C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)

add_library(pd1180_control STATIC
  src/control.c
  src/tmc5160_config.c
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
