@echo off

setlocal

set "link_src=%cd%\%1"
set "link_dest=%cd%\%2"

echo %link_src%
echo %link_dest% 

mklink "%link_dest%" "%link_src%"