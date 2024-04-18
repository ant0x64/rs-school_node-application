import OS from "./modules/os/index.js";
import Hash from "./modules/hash/index.js";
import Compressor from "./modules/compressor/index.js";
import Manager from "./modules/manager/index.js";

export default class Application {

    /** @type {Manager} */
    manager = null;

    constructor() {
        this.manager = new Manager;
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
        await this.manager.up();
    }
    async _cd (path) {
        await this.manager.cd(path);
    }
    async _ls () {
        const list = await this.manager.ls();

        let output = '\x1b[0m';
        output+=(`\x1b[1m\x1b[35mTotal Directories: ${list.dirs.length}\x1b[0m`) + OS.getEOL();
        output+=(`\x1b[1m\x1b[35mTotal Files: ${list.files.length}\x1b[0m`) + OS.getEOL();
        list.dirs.map(dir_name => {
            output+=(`\x1b[1m\x1b[100m${dir_name}\x1b[0m`) + OS.getEOL();
        });
        list.files.map(file_name => {
            output+=(`\x1b[37m${file_name}\x1b[0m`) + OS.getEOL();
        });

        return output.trim();
    }
    async _cat (path) {
        /** @todo implement it with Process Manager */
        await this.manager.cat(path, process.stdout);
    }
    async _add (name) {
        await this.manager.add(name);
        return true;
    }
    async _rn (path, new_path) {
        await this.manager.rn(path, new_path); 
        return true;
    }
    async _rm (path) {
        await this.manager.rm(path);
        return true;
    }
    async _cp (file_path, destination_dir) {
        await this.manager.cp(file_path, destination_dir);
        return true;
    }
    async _mv (file_path, destination_dir) {
        await this.manager.mv(file_path, destination_dir);
        return true;
    }
    _os (...args) {
        if(!args[0] || !(args[0] instanceof Object)) {
            return Application.throwInputError();
        }

        const params = Object.keys(args[0]);
        if(params.length > 1) {
            return Application.throwArgumentsError(1);
        }
        
        switch(params[0]) {

        case 'EOL':
            return (`EOL is equel to: \x1b[1m${JSON.stringify(OS.getEOL().toString())}\x1b[22m`);
        case 'cpus' : {
            const cpus = OS.getCpus();
            let output = '\x1b[49m';

            if(!cpus) {
                return Application.throwInvalidOutput();
            }
            output+=(`Overall amount of CPUS: \x1b[1m${cpus.length}\x1b[22m`) + OS.getEOL();
            output+=(`Model: \x1b[1m${cpus[0].model}\x1b[22m`) + OS.getEOL();
  
            cpus.map((cpu, index) => {
                output+=(`CPU ${(index + 1)} clock rate is: \x1b[1m${cpu.clock}GHz\x1b[22m`) + OS.getEOL();
            });

            return output.trim();
        } 
        case 'homedir':
            return (`Your home dir is: \x1b[1m${OS.getHomedir()}\x1b[22m`);
        case 'username':
            return (`Username is: \x1b[1m${OS.getUsername()}\x1b[22m`);
        case 'architecture':
            return (`Architecture is: \x1b[1m${OS.getArchitecture()}\x1b[22m`);
        default :
            Application.throwArgumentsError();
        }
    }
    async _hash(path) { 
        return (`Hash: \x1b[1m${(await Hash.create(
            this.manager.getAbsolutePath(path)
        ))}\x1b[0m`);
    }
    async _compress(source, destination) {
        await Compressor.compress(
            this.manager.getAbsolutePath(source), 
            this.manager.getAbsolutePath(destination)
        );
        return true;
    }
    async _decompress(source, destination) {
        await Compressor.decompress(
            this.manager.getAbsolutePath(source), 
            this.manager.getAbsolutePath(destination)
        );
        return true;
    }

    /**
     * @param {string} command 
     * @param {[string]} args 
     * @param {{:<string>}} params 
     */
    async handleCommand(command, args, params) {
        const fn = this['_' + command];

        if(!fn) {
            Application.throwInputError();
        } else if (fn.length !== args.length) {
            Application.throwArgumentsError(fn.length);
        }
        fn.params = params;

        return await fn.bind(this)(...args, params);
    }
}
