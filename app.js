import Session from "./src/lib/session.js";
import CommandParser from "./src/lib/command-parser.js";
import Application from "./src/application.js";

import process from 'node:process';
import { homedir } from "node:os";

process.chdir(homedir());

const { username } = CommandParser.parseParams(process.argv.slice(2));
const session = new Session(username);

session.welcome();
session.showCurrentPath();
session.showPrompt();

const application = new Application();

/** @todo implement it as pipeline with transform streams */
process.stdin.on('data', async (data) => {

    const space_replacer = '\\xa0';
    const input = data.toString().trim();

    if (!input) {
        session.back();
        return;
    }

    const inputArray = input
        .replace(/\\\s/, space_replacer)
        .replace(/(['"])[^'"]*(['"])/g, (match) => {
            return match.replace(/['"]+/g, '').replace(/\s/g, space_replacer);
        })
        .split(/\s+/).map(value => value.replace(space_replacer, ' '));

    const [command, ...args] = CommandParser.parseArgv(inputArray);
    const params = CommandParser.parseParams(inputArray);

    if (command === '.exit') {
        session.shutdown();
    }

    try {
        const result = await application.handleCommand(command, args, params);
        if (result === true) {
            session.success();
        } else if (typeof result === 'string') {
            session.message(result, 'result');
        }
    } catch (err) {
        session.message(err.message, 'error');
        session.error();
    }
    session.showCurrentPath();
    session.showPrompt();
});

process.on('SIGINT', () => {
    session.message(''); // linebreak
    session.shutdown();
});
