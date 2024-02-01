'use strict';

import Cli from "./src/cli/index.js";
import fileManager from "./src/file-manager/index.js";

import process from 'node:process';
import { EOL } from "node:os";


let { username } = Cli.parse(process.argv.slice(2));

if(!username || typeof username !== 'string') {
    username = 'Noname';
}

class ProcessManager {
    COLORS = {
        text: {
            default: 34,
            error: 91,
            success: 92,
            warning: 43
        }
    }
    message = (message, type) => {
        process.stdout.write(`\x1b[${this.COLORS.text[type]??this.COLORS.text.default}m${message}\x1b[0m` + EOL);
    }
    shutdown = () => {
        this.message(`Thank you for using File Manager, ${username}, goodbye!`)
        process.stdin.removeAllListeners();
        process.exit();
    }
    success = () => {
        this.message('Operation completed', 'success')
    }
    error = () => {
        this.message('Operation failed', 'error')
    }
    invalidInput = () => {
        this.message('Invalid input', 'error');
    }
    showCurrentPath = (path) => {
        this.message(`${EOL}You are currently in \x1b[1m${path}`);
    }
}
const processManager = new ProcessManager();

processManager.message(`Welcome to the File Manager, ${username}!`);
processManager.showCurrentPath(fileManager.getCurrentPath());

process.stdin.on('data', async (data) => {
    const commmand = data.toString().trim();
    if(commmand === '.exit') {
        processManager.shutdown();
    }

    const {0: command, ...args} = Cli.parse(commmand.split(/\s+/));

    const commandsMap = {

        list: {
            'up': async () => {
                return fileManager.up();
            },
            'cd': async (path) => {
                return fileManager.cd(path);
            },
            'ls': async () => {
                const list = await fileManager.ls();
                processManager.message(`\x1b[45mTotal Dirs: ${list.dirs.length}`);
                processManager.message(`\x1b[45mTotal Files: ${list.files.length}`);
                list.dirs.map(dir_name => {
                    processManager.message('\x1b[1m\x1b[100m' + dir_name);
                });
                list.files.map(file_name => {
                    processManager.message('\x1b[37m' + file_name);
                });
            },
            'cat': null,
            'add': null,
            'rn': async (path, new_path) => {
                await fileManager.rn(path, new_path); 
                processManager.success('File ')
            },
            'rm': async (path) => {
                return fileManager.rm(path);
            },
            'cp': null,
            'mv': null,
            'os': null,
            'hash': null,
            'compress': null,
            'decompress': null,
        },

        throwArgumentsError() {
            throw new Error('Incorrect arguments');
        },
        throwInputError() {
            throw new Error('Invalid input');
        },

        async run(command) {
            const fn = this['list'][command];
            const params = Object.values(args);

            if(!fn) {
                this.throwInputError();
            } else if (fn.length !== params.length) {
                if(!fn.length) {
                    processManager.message('Operation doesn\'t have arguments', 'warning');
                } else {
                    processManager.message(`Number of arguments required: ${fn.length}`, 'warning');
                }
                this.throwArgumentsError();
            }
            await fn(...params);
        }
    };

    try {
        await commandsMap.run(command);
    } catch(err) {
        /** @todo */
        processManager.message(err.message, 'error');
    }
    processManager.showCurrentPath(fileManager.getCurrentPath());

});

process.on('SIGINT', () => {
    processManager.message(''); // linebreak
    processManager.shutdown();
});
