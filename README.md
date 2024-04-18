## Node.js File Manager

This repository contains the implementation of a File Manager using Node.js APIs in accordance with [Task assigments](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/file-manager/assignment.md). The File Manager allows users to perform various file operations, interact through the command line interface (CLI), utilize Streams API, get information about the host machine operating system, and perform hash calculations and file compression/decompression.

**How to run**: 
```bash
node app.js --username=name
```
**or**
```bash
npm start
```

### Features

#### Base Commands

- `ls`: list all files and folders in the current directory.
- `up`: navigate to the parent directory.
- `cd <path_to_directory>`: change the current directory to the specified path.

#### File Operations

- `cat <source_path>`:  read the content of the specified file and print it to the console.
- `add <file_path>`:  create an empty file with the provided name.
- `rn <source_path> <dest_path>`: rename the specified file.
- `cp <source_path> <dest_path>`:  copy the specified file to the new directory.
- `mv <source_path> <dest_path>`:  move the specified file to the new directory.
- `rm <source_path>`:  delete the specified file.

#### Operating System Info

- `os --EOL`:  print the system's default End-Of-Line character sequence to the console.
- `os --cpus`:  retrieve information about the host machine's CPUs, including the total number, model, and clock rate for each CPU core.
- `os --homedir`:  get the home directory of the current user.
- `os --username`:  get the current system user's name.
- `os --architecture`:  get the CPU architecture.

#### Hash Calculation

- `hash <source_path>`:  calculate the hash for the specified file.

#### Compression & Decompression

- `compress <source_path> <path_to_destination>`:  compress the specified file and save it to the destination path.
- `decompress <source_path> <path_to_destination>`:  decompress the specified file and save it to the destination path.
