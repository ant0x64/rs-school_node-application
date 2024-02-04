import Cli from "./src/cli/index.js";
import ProcessManager from "./src/process-manager/index.js";
import CommandsMap from "./src/commands-map/index.js";

import process from 'node:process';
import { homedir } from "node:os";

process.chdir(homedir());

const { username } = Cli.parseParams(process.argv.slice(2));
const processManager = new ProcessManager(username);

processManager.welcome();
processManager.showCurrentPath();
processManager.showPrompt();

const commandsMap = new CommandsMap();

/** @todo implement it as pipeline with transform streams */
process.stdin.on('data', async (data) => {

    const space_replacer = '\\xa0';
    const dataArray = data.toString().trim()
        .replace(/\\\s/, space_replacer)
        .replace(/(['"])[^'"]*(['"])/g, (match) => {
            return match.replace(/['"]+/g, '').replace(/\s/g, space_replacer);
        })
        .split(/\s+/).map(value => value.replace(space_replacer, ' '));

    const [command, ...args] = Cli.parseArgv(dataArray);
    const params = Cli.parseParams(dataArray);

    if(!command) {
        processManager.showCurrentPath();
        processManager.showPrompt();
        return;
    }

    if(command === '.exit') {
        processManager.shutdown();
    }

    try {
        const result = await commandsMap.run(command, args, params);
        if(result === true) {
            processManager.success();
        } else if (typeof result === 'string') {
            processManager.message(result, 'result');
        }
    } catch(err) {
        processManager.message(err.message, 'error');
        processManager.error();
    }
    processManager.showCurrentPath();
    processManager.showPrompt();
});

process.on('SIGINT', () => {
    processManager.message(''); // linebreak
    processManager.shutdown();
});
