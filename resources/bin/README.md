# Sidecar Binary Directory

This directory contains the self-contained Windows executable and assets for the C# Bitmap Engine:

- `BitmapFontApi.exe`: Compiled from `bitmapapi/BitmapFontApi.csproj` using .NET 8 self-contained win-x64.
- `icons.ttf`: Google Material Symbols font asset.

These files are populated automatically when running `build-windows.bat`, `build-windows.ps1`, or via the GitHub Actions CI/CD workflow.
When packaging with `electron-builder`, everything in this directory is copied into the application's `resources/bin` folder.
