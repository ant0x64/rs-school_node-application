# Node.js File Manager

This repository contains the implementation of a File Manager using Node.js APIs in accordance with [Task assigments](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/file-manager/assignment.md). The File Manager allows users to perform various file operations, interact through the command line interface (CLI), utilize Streams API, get information about the host machine operating system, and perform hash calculations and file compression/decompression.

**How to run**: 
```bash
node app.js --username=name
```
**or**
```bash
npm start
```

## Features

### Base Commands

- `ls`: List all files and folders in the current directory.
- `up`: Navigate to the parent directory.
- `cd <path_to_directory>`: Change the current directory to the specified path.

### File Operations

- `cat <source_path>`:  Read the content of the specified file and print it to the console.
- `add <file_path>`:  Create an empty file with the provided name.
- `rn <source_path> <dest_path>`:  Rename the specified file. The content remains unchanged.
- `cp <source_path> <dest_path>`:  Copy the specified file to the new directory.
- `mv <source_path> <dest_path>`:  Move the specified file to the new directory.
- `rm <source_path>`:  Delete the specified file.

### Operating System Info

- `os --EOL`:  Print the system's default End-Of-Line character sequence to the console.
- `os --cpus`:  Retrieve information about the host machine's CPUs, including the total number, model, and clock rate for each CPU core.
- `os --homedir`:  Get the home directory of the current user.
- `os --username`:  Get the current system user's name.
- `os --architecture`:  Get the CPU architecture for which the Node.js binary has been compiled.

### Hash Calculation

- `hash <source_path>`:  Calculate the hash for the specified file.

### Compression & Decompression

- `compress <source_path> <path_to_destination>`:  Compress the specified file and save it to the destination path.
- `decompress <source_path> <path_to_destination>`:  Decompress the specified file and save it to the destination path.
