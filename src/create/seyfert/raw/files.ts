interface file {
    name: string,
    code: string
}

export const files: file[] = [
    {
        name: "seyfert.config.mjs",
        code: `// @ts-check
import { GatewayIntentBits } from "seyfert/lib/types/index.js";
import { config } from "seyfert";

export default config.bot({
    token: process.env.BOT_TOKEN ?? '',
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ],
    locations: {
        base: "dist",
        commands: "commands",
        events: "events"
    }
});`
    },
    {
        name: "index.ts",
        code: `import { Client, ParseClient, ParseMiddlewares, UsingClient } from "seyfert";
import { middlewares } from "./middlewares/middlewares";
import "dotenv/config";
import { CooldownManager } from "@slipher/cooldown";

const client = new Client() as UsingClient & Client;

client.setServices({
    middlewares: middlewares,
});

client.start().then(async () => {
    client.cooldown = new CooldownManager(client);
    await client.uploadCommands().catch(error => console.log(error));
});

declare module 'seyfert' {
    interface UsingClient extends ParseClient<Client<true>> {}
    interface RegisteredMiddlewares
    extends ParseMiddlewares<typeof middlewares> {}
    interface UsingClient {
        cooldown: CooldownManager;
    }
}

process.on('unhandledRejection', async (err) => {
    console.error(err);
});`
    },
    {
        name: "test.command.ts",
        code: `import {  Declare, Command, type CommandContext, IgnoreCommand } from 'seyfert';

@Declare({
    name: "test",
    description: "Just a test command",
    integrationTypes: [ "GuildInstall" ],
    ignore: IgnoreCommand.Message
})

export default class TestCommand extends Command {
    async run(ctx: CommandContext) {
        ctx.write({
            content: 'test!'
        });
    }
}`
    },
    {
        name: "middlewares.ts",
        code: `export const middlewares = {}`
    },
    {
        name: "ready.ts",
        code: `import { createEvent } from 'seyfert';

export default createEvent({
    data: { name: 'ready' },
    async run(user, client) {
        client.logger.info(\`Bot Online (\${user.username})\`);
    }
});`
    }
];

export function getFile (name: string): file | undefined {
    return files.find(f => f.name === name);
}