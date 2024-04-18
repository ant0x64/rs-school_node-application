import { homedir } from 'node:os';
import { opendir, rename, unlink, stat } from 'node:fs/promises';
import { join, basename, isAbsolute, normalize } from 'node:path';

import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline, finished } from 'node:stream/promises';

import { Stats } from 'node:fs'; // eslint-disable-line no-unused-vars
import { Writable } from 'node:stream'; // eslint-disable-line no-unused-vars

export default class Manager {
    /**
     * @type {string}
     */
    _currentDir = null;

    constructor() {
        this._currentDir = process.cwd();
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
        if(!isAbsolute(path)) {
            path = join(this._currentDir, path);
        }
        return normalize(path);
    }
    
    /**
     * Go to dedicated folder from current directory (path_to_directory can be relative or absolute)
     * @param {string} path
     */
    async cd(path) {
        const dir = await opendir(this.getAbsolutePath(path));

        this._currentDir = dir.path;
        process.chdir(dir.path);
        
        dir.close();
    }

    /**
     * Go upper from current directory (when you are in the root folder this operation shouldn't change working directory)
     */
    async up() {
        return this.cd('..');
    }

    /**
     * Print in console list of all files and folders in current directory. List should contain:
     *  - list should contain files and folder names (for files - with extension);
     *  - folders and files are sorted in alphabetical order ascending, but list of folders goes first;
     *  - type of directory content should be marked explicitly (e.g. as a corresponding column value).
     * 
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
     * @returns {Promise<void>}
     */
    async rn(path, new_path) {
        const destination_path = this.getAbsolutePath(new_path);

        await stat(destination_path).then(
            /**
             * @param {Stats} stat 
             */
            () => {
                throw new Error('The destination file exists');
            }, () => {}
        );

        return rename(
            this.getAbsolutePath(path),
            destination_path
        );
    }

    /**
     * Delete file
     * @param {string} path 
     * @return {Promise<void>}
     */
    async rm(path) {
        return unlink(this.getAbsolutePath(path));
    }

    /**
     * Copy file (should be done using Readable and Writable streams)
     * @param {string} source 
     * @param {string} destination 
     */
    async cp(source, destination) {
        const source_path = this.getAbsolutePath(source);
        let   destination_path = this.getAbsolutePath(destination);

        await stat(destination_path).then(
            /**
             * @param {Stats} stat 
             */
            (stat) => {
                if(stat.isFile()) {
                    throw new Error('The destination file exists');
                } else if (stat.isDirectory()) {
                    destination_path = join(destination_path, basename(source_path));
                }
            }, () => {}
        );

        await stat(source_path).then(
            async (stat) => {
                /**
                * @param {Stats} stat 
                */
                if(stat.isDirectory()) {
                    throw new Error('The source path can\'t be a directory')
                }
                await this.add(destination_path);
            
                const readStream = createReadStream(source_path);
                const writeStream = createWriteStream(destination_path);
                await pipeline(readStream, writeStream);
            }, () => {
                throw new Error('The source file doesn\'t exist');
            }
        );
    }

    /**
     * Move file (same as copy but initial file is deleted, copying part should be done using Readable and Writable streams)
     * @param {string} source
     * @param {string} destination 
     */
    async mv(source, destination) {
        await this.cp(source, destination);
        return this.rm(source);
    }

    /**
     * Read file and print it's content in console (should be done using Readable stream)
     * @param {string} path 
     * @param {Writable} output 
     */
    async cat(path, output) {
        const absolute_path = this.getAbsolutePath(path);

        await stat(absolute_path).then(
            /**
             * 
             * @param {Stats} stats 
             */
            (stat) => {
                if(stat.isDirectory()) {
                    throw new Error('There\'s the category by the path');
                }
            }
        );

        await pipeline(createReadStream(absolute_path), output, {
            end: false
        });
    }
    
    /**
     * Create empty file in current working directory
     * @param {string} name 
     */
    async add(name) {
        const path = this.getAbsolutePath(name);

        await stat(path).then(
            /**
             * 
             * @param {Stats} stats 
             */
            (stat) => {
                if(stat.isDirectory()) {
                    throw new Error('There\'s the category with the same name');
                } else {
                    throw new Error('File exists');
                }
            }, async () => {
                const stream = createWriteStream(path);
                await finished(stream).finally(stream.close()); 
            }
        );
    }
}