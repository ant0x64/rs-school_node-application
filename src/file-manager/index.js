'use stric';

import { homedir } from 'node:os';
import { opendir, rename, unlink } from 'node:fs/promises';
import {} from 'stream/promises';
import { join } from 'path';

import { Dir, Dirent } from 'node:fs'; // eslint-disable-line no-unused-vars

class FileManager {
    /**
     * @type {string}
     */
    _currentDir = null;

    constructor() {
        this._currentDir = homedir();
    }

    getHomeDir = homedir

    getCurrentPath() {
        return this._currentDir;
    }

    /**
     * @param {string} path 
     * @returns string
     */
    getAbsolutePath(path) {
        if(!path.startsWith('/')) {
            path = join(this._currentDir, path);
        }
        return path;
    }
    
    /**
     * Go to dedicated folder from current directory (path_to_directory can be relative or absolute)
     * @param {string} path
     */
    async cd(path) {
        const dir = await opendir(this.getAbsolutePath(path));

        this._currentDir = dir.path;
        dir.close();
    }

    /**
     * Go upper from current directory (when you are in the root folder this operation shouldn't change working directory)
     */
    up() {
        return this.cd('..');
    }

    /**
     * Print in console list of all files and folders in current directory. List should contain:
     *  - list should contain files and folder names (for files - with extension);
     *  - folders and files are sorted in alphabetical order ascending, but list of folders goes first;
     *  - type of directory content should be marked explicitly (e.g. as a corresponding column value).
     * 
     * @async
     * @returns {Promise<{files:[],dirs:[]}>}
     */
    async ls() {
        const filesList = [];
        const foldersList = [];
    
        const dir = await opendir(this._currentDir);
        for await (const dirent of dir) {
            dirent.isFile()? filesList.push(dirent.name) : foldersList.push(dirent.name);
        }
    
        return {
            dirs: foldersList.sort(),
            files: filesList.sort()
        };
    }

    /**
     * Rename file (content should remain unchanged)
     * @param {string} path 
     * @param {string} new_path 
     * @async
     * @returns {Promise<void>}
     */
    async rn(path, new_path) {
        return rename(
            this.getAbsolutePath(path),
            this.getAbsolutePath(new_path)
        );
    }

    /**
     * Delete file
     * @param {string} path 
     */
    rm(path) {
        return unlink(this.getAbsolutePath(path));
    }

    /**
     * Copy file (should be done using Readable and Writable streams)
     * @param {string} path 
     * @param {string} new_path 
     */
    async cp(path, new_path) {}

    /**
     * Move file (same as copy but initial file is deleted, copying part should be done using Readable and Writable streams)
     * @param {string} path
     * @param {string} new_path 
     */
    async mv(path, new_path) {}

    /**
     * Read file and print it's content in console (should be done using Readable stream)
     * @param {string} path 
     */
    async cat(path) {}
    
    /**
     * Create empty file in current working directory
     * @param {string} path 
     */
    async add(path) {

    }
}

const fileManager = new FileManager;
export default fileManager;