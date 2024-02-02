import Cli from "./src/cli/index.js";
import OS from "./src/os/index.js";
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
            warning: 43,
            result: 45
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
            async 'up' () {
                return fileManager.up();
            },
            async 'cd' (path) {
                return fileManager.cd(path);
            },
            async 'ls' () {
                const list = await fileManager.ls();
                processManager.message(`\x1b[45mTotal Dir[s]: ${list.dirs.length}`);
                processManager.message(`\x1b[45mTotal File[s]: ${list.files.length}`);
                list.dirs.map(dir_name => {
                    processManager.message('\x1b[1m\x1b[100m' + dir_name);
                });
                list.files.map(file_name => {
                    processManager.message('\x1b[37m' + file_name);
                });
            },
            async 'cat' (path) {
                return await fileManager.cat(path, process.stdout);
            },
            async 'add' (name) {
                await fileManager.add(name);
                processManager.success();
            },
            async 'rn' (path, new_path) {
                await fileManager.rn(path, new_path); 
                processManager.success();
            },
            async 'rm' (path) {
                await fileManager.rm(path);
                processManager.success();
            },
            async 'cp' (file_path, destination_dir) {
                await fileManager.cp(file_path, destination_dir);
                processManager.success();
            },
            async 'mv' (file_path, destination_dir) {
                await fileManager.mv(file_path, destination_dir);
                processManager.success();
            },
            'os' (param) {
                
                switch(param) {

                case '--EOL':
                    processManager.message(`EOL is equel to: \x1b[1m${OS.getEOL()}`, 'result');
                    break;
                case '--cpus' : {
                    const cpus = OS.getCpus();
                    if(!cpus) {
                        return this.throwInputOutput();
                    }
                    processManager.message(`Overall amount of CPUS: \x1b[1m${cpus.length}`, 'result');
                    processManager.message(`Model: \x1b[1m${cpus[0].model}`, 'result');
                    cpus.map((cpu, index) => {
                        processManager.message(`CPU ${(index + 1)} clock rate is: \x1b[1m${cpu.clock}GHz`, 'result');
                    });
                    break;
                } 
                case '--homedir':
                    processManager.message(`Your home dir is: \x1b[1m${OS.getHomedir()}`, 'result');
                    break;
                case '--username':
                    processManager.message(`Username is: \x1b[1m${OS.getUsername()}`, 'result');
                    break;
                case '--architecture':
                    processManager.message(`Architecture is: \x1b[1m${OS.getArchitecture()}`, 'result');
                    break;
                default :
                    this.throwArgumentsError();
                }
            },
            'hash': null,
            'compress': null,
            'decompress': null,
        },

        throwArgumentsError(argumentsNeed) {
            if(argumentsNeed > 0) {
                throw new Error(`Number of arguments required: ${argumentsNeed}`, 'warning');
            } else if (argumentsNeed === 0) {
                throw new Error('Operation doesn\'t have arguments', 'warning');
            } else {
                throw new Error('Incorrect arguments');
            }
        },
        throwInputError() {
            throw new Error('Invalid input');
        },
        throwInputOutput() {
            throw new Error('Invalid input');
        },

        async run(command) {
            const fn = this['list'][command];
            const params = Object.values(args);

            if(!fn) {
                this.throwInputError();
            } else if (fn.length !== params.length) {
                this.throwArgumentsError(fn.length);
            }
            await fn.bind(this)(...params);
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
