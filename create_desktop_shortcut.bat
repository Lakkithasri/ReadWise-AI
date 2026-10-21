@echo off
title Create ReadWise AI Desktop Shortcut
echo Creating desktop shortcut for ReadWise AI...

set SCRIPT_DIR=%~dp0
set TARGET=%SCRIPT_DIR%start_app.bat

powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut(\"$desktop\ReadWise AI.lnk\"); $s.TargetPath = '%TARGET%'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.Description = 'Launch ReadWise AI'; $s.Save()"

echo.
echo ========================================================
echo SUCCESS: "ReadWise AI" shortcut created on your Desktop!
echo You can now simply double-click the icon on your Desktop
echo anytime to launch the entire system and browser.
echo ========================================================
echo.
pause
