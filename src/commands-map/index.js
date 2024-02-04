import OS from "./../os/index.js";
import Hash from "./../hash/index.js";
import Compressor from "./../compressor/index.js";
import FileManager from "./../file-manager/index.js";

export default class CommandsMap {

    /** @type {FileManager} */
    fileManager = null;

    constructor() {
        this.fileManager = new FileManager;
    }
    
    static throwArgumentsError(argumentsNeed) {
        if(argumentsNeed > 0) {
            throw new Error(`Number of arguments required: ${argumentsNeed}`);
        } else if (argumentsNeed === 0) {
            throw new Error('Operation doesn\'t have arguments');
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
        await this.fileManager.up();
    }
    async _cd (path) {
        await this.fileManager.cd(path);
    }
    async _ls () {
        const list = await this.fileManager.ls();

        let output = '\x1b[0m';
        output+=(`\x1b[1m\x1b[35mTotal Directories: ${list.dirs.length}\x1b[0m`) + OS.getEOL();
        output+=(`\x1b[1m\x1b[35mTotal Files: ${list.files.length}\x1b[0m`) + OS.getEOL();
        list.dirs.map(dir_name => {
            output+=(`\x1b[1m\x1b[100m${dir_name}\x1b[0m`) + OS.getEOL();
        });
        list.files.map(file_name => {
            output+=(`\x1b[37m${file_name}\x1b[0m`) + OS.getEOL();
        });

        return output;
    }
    async _cat (path) {
        /** @todo implement it with Process Manager */
        await this.fileManager.cat(path, process.stdout);
    }
    async _add (name) {
        await this.fileManager.add(name);
        return true;
    }
    async _rn (path, new_path) {
        await this.fileManager.rn(path, new_path); 
        return true;
    }
    async _rm (path) {
        await this.fileManager.rm(path);
        return true;
    }
    async _cp (file_path, destination_dir) {
        await this.fileManager.cp(file_path, destination_dir);
        return true;
    }
    async _mv (file_path, destination_dir) {
        await this.fileManager.mv(file_path, destination_dir);
        return true;
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
            return (`EOL is equel to: \x1b[1m${JSON.stringify(OS.getEOL().toString())}\x1b[0m`);
        case 'cpus' : {
            const cpus = OS.getCpus();
            let output = '';

            if(!cpus) {
                return CommandsMap.throwInvalidOutput();
            }
            output+=(`Overall amount of CPUS: \x1b[1m${cpus.length}\x1b[0m`) + OS.getEOL();
            output+=(`Model: \x1b[1m${cpus[0].model}\x1b[0m`) + OS.getEOL();
            cpus.map((cpu, index) => {
                output+=(`CPU ${(index + 1)} clock rate is: \x1b[1m${cpu.clock}GHz\x1b[0m`) + OS.getEOL();
            });

            return output;
        } 
        case 'homedir':
            return (`Your home dir is: \x1b[1m${OS.getHomedir()}\x1b[0m`);
        case 'username':
            return (`Username is: \x1b[1m${OS.getUsername()}\x1b[0m`);
        case 'architecture':
            return (`Architecture is: \x1b[1m${OS.getArchitecture()}\x1b[0m`);
        default :
            CommandsMap.throwArgumentsError();
        }
    }
    async _hash(path) { 
        return (`Hash: \x1b[1m${(await Hash.create(
            this.fileManager.getAbsolutePath(path)
        ))}\x1b[0m`);
    }
    async _compress(source, destination) {
        await Compressor.compress(
            this.fileManager.getAbsolutePath(source), 
            this.fileManager.getAbsolutePath(destination)
        );
        return true;
    }
    async _decompress(source, destination) {
        await Compressor.decompress(
            this.fileManager.getAbsolutePath(source), 
            this.fileManager.getAbsolutePath(destination)
        );
        return true;
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

        return await fn.bind(this)(...args, params);
    }
}
