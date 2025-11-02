@echo off
echo Creating folder structure...
cd Backend
if not exist utils mkdir utils
if not exist middleware mkdir middleware
if not exist routes mkdir routes
if not exist services mkdir services
echo Folders created successfully!
pause
