# norminette-vscode

Epitech coding style verification for VSCode

---

## Features
- Check for coding style errors using the [official Docker image](https://github.com/epitech/epitest-coding-style-docker/pkgs/container/coding-style-checker)
- Highlight errors using the VSCode Diagnostics API

---

## Requirements
- Linux or Windows with WSL
- VSCode 1.72.0 or newer
- Docker installed on the host computer
- User in Docker group (the extension cannot execute sudo commands !)

---

## How to use

Use commands from the VSCode Commands Palette using <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
</br>
To search for coding style errors, use the `Check for any coding style errors` command
</br>
To remove the highlighted errors, use the `Clear all the detected coding style errors` command
</br>