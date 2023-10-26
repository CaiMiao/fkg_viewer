
Run "Flower knight girl Viewer.exe" to play.
Do not run the file "Flower knight girl Viewer.html" directly or you will get CORS errors when playing an animated scene since the spine player runtime requires direct file access.

All the viewer's content is in the folder: "package.nw", the rest is a standard nwjs install.
You can download nwjs from: "https://nwjs.io/downloads/", extract it and then copy the folder "package.nw" to the extracted nwjs folder and then run: "nw.exe" to play.
If you don't want to use nwjs you can run: "Flower knight girl Viewer.html" directly, but you have to pass the argument: "--allow-file-access-from-files" to chrome for it to work correctly.

This is a Windows 7/8/8.1/10/11 64bit install, if you use Linux or MacOS, download nwjs from the link above and copy the "package.nw" folder to the extracted nwjs folder, 
then run: ./nw on linux or nwjs.app/Contents/MacOS/nwjs on MacOS.
Win 32bit users need to use this nwjs version instead: https://dl.nwjs.io/v0.72.0/nwjs-sdk-v0.72.0-win-ia32.zip
Win XP/Vista is not supported.

To uninstall, delete the main folder plus the folder at: "%localappdata%\flower_knight_girl_viewer"