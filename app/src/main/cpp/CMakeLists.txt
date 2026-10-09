cmake_minimum_required(VERSION 3.22.1)

project("aegisdroid")

add_library(
        native-lib
        SHARED
        native-lib.cpp)

find_library(
        log-lib
        log)

find_library(
        android-lib
        android)

target_link_libraries(
        native-lib
        ${log-lib}
        ${android-lib})

set_target_properties(native-lib PROPERTIES
        CXX_STANDARD 17
        CXX_STANDARD_REQUIRED ON)
