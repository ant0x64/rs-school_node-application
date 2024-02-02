import Cli from "./src/cli/index.js";
import ProcessManager from "./src/process-manager/index.js";
import OS from "./src/os/index.js";
import fileManager from "./src/file-manager/index.js";

import process from 'node:process';


const { username } = Cli.parseParams(process.argv.slice(2));
const processManager = new ProcessManager(username);

processManager.welcome();
processManager.showCurrentPath(fileManager.getCurrentPath());
processManager.showPrompt();

class CommandsMap {
    
    static throwArgumentsError(argumentsNeed) {
        if(argumentsNeed > 0) {
            throw new Error(`Number of arguments required: ${argumentsNeed}`, 'warning');
        } else if (argumentsNeed === 0) {
            throw new Error('Operation doesn\'t have arguments', 'warning');
        } else {
            throw new Error('Incorrect arguments');
        }
    }
    static throwInputError() {
        throw new Error('Invalid input');
    }
    static throwInvalidOutput() {
        throw new Error('Invalid output');
    }

    async _up () {
        return fileManager.up();
    }
    async _cd (path) {
        return fileManager.cd(path);
    }
    async _ls () {
        const list = await fileManager.ls();
        processManager.message(`\x1b[45mTotal Dir[s]: ${list.dirs.length}`);
        processManager.message(`\x1b[45mTotal File[s]: ${list.files.length}`);
        list.dirs.map(dir_name => {
            processManager.message('\x1b[1m\x1b[100m' + dir_name);
        });
        list.files.map(file_name => {
            processManager.message('\x1b[37m' + file_name);
        });
    }
    async _cat (path) {
        await fileManager.cat(path, process.stdout);
    }
    async _add (name) {
        await fileManager.add(name);
        processManager.success();
    }
    async _rn (path, new_path) {
        await fileManager.rn(path, new_path); 
        processManager.success();
    }
    async _rm (path) {
        await fileManager.rm(path);
        processManager.success();
    }
    async _cp (file_path, destination_dir) {
        await fileManager.cp(file_path, destination_dir);
        processManager.success();
    }
    async _mv (file_path, destination_dir) {
        await fileManager.mv(file_path, destination_dir);
        processManager.success();
    }
    _os (...args) {
        if(!args[0] || !(args[0] instanceof Object)) {
            return CommandsMap.throwInputError();
        }

        const params = Object.keys(args[0]);
        if(params.length > 1) {
            return CommandsMap.throwArgumentsError(1);
        }
        
        switch(params[0]) {

        case 'EOL':
            processManager.message(`EOL is equel to: \x1b[1m${OS.getEOL()}`, 'result');
            break;
        case 'cpus' : {
            const cpus = OS.getCpus();
            if(!cpus) {
                return CommandsMap.throwInvalidOutput();
            }
            processManager.message(`Overall amount of CPUS: \x1b[1m${cpus.length}`, 'result');
            processManager.message(`Model: \x1b[1m${cpus[0].model}`, 'result');
            cpus.map((cpu, index) => {
                processManager.message(`CPU ${(index + 1)} clock rate is: \x1b[1m${cpu.clock}GHz`, 'result');
            });
            break;
        } 
        case 'homedir':
            processManager.message(`Your home dir is: \x1b[1m${OS.getHomedir()}`, 'result');
            break;
        case 'username':
            processManager.message(`Username is: \x1b[1m${OS.getUsername()}`, 'result');
            break;
        case 'architecture':
            processManager.message(`Architecture is: \x1b[1m${OS.getArchitecture()}`, 'result');
            break;
        default :
            CommandsMap.throwArgumentsError();
        }
    }
    async _hash(path) { 
        processManager.message(`Hash: \x1b[1m${(fileManager.hash(path))}`, 'result');
    }
    async _compress(source, destination) {
        await fileManager.compress(source, destination);
        processManager.success();
    }
    async _decompress(source, destination) {
        await fileManager.decompress(source, destination);
        processManager.success();
    }

    /**
     * @param {string} command 
     * @param {[string]} args 
     * @param {{:<string>}} params 
     */
    async run(command, args, params) {
        const fn = this['_' + command];

        if(!fn) {
            CommandsMap.throwInputError();
        } else if (fn.length !== args.length) {
            CommandsMap.throwArgumentsError(fn.length);
        }
        fn.params = params;

        await fn(...args, params);
    }
}
const commandsMap = new CommandsMap;

process.stdin.on('data', async (data) => {
    const dataArray = data.toString().trim().split(/\s+/);
    const [command, ...args] = Cli.parse(dataArray);
    const params = Cli.parseParams(dataArray);

    if(!command) {
        return;
    }

    if(command === '.exit') {
        processManager.shutdown();
    }

    try {
        await commandsMap.run(command, args, params);
    } catch(err) {
        /** @todo */
        processManager.message(err.message, 'error');
    }
    processManager.showCurrentPath(fileManager.getCurrentPath());
    processManager.showPrompt();
});

process.on('SIGINT', () => {
    processManager.message(''); // linebreak
    processManager.shutdown();
});
