import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { ProgressTask, wait } from '../../utils';
import { getFile } from './raw/files';
import { terminal } from 'terminal-kit';
const execAsync = promisify(exec);

export async function createSeyfert (dir: string): Promise<ProgressTask[]> {
    terminal('BOT TOKEN: ');

    const token = await terminal.inputField({
        echo: false,
    }).promise;

    terminal('\n');

    if (token) terminal.green('+ BOT TOKEN');
    else terminal.red('- BOT TOKEN\n' );
    await wait(500);

    return [
        {
            name: 'Creando directorio',
            task: async () => {
                await fs.mkdir(dir, { recursive: true });
            }
        },
        {
            name: 'Inicializando npm',
            task: async () => {
                await execAsync(`npm init -y`, { cwd: dir });
            }
        },
        {
            name: 'Instalando dependencias',
            task: async () => {
                await execAsync(`npm install typescript dotenv ts-node @types/node seyfert @slipher/cooldown`, { cwd: dir });
            }
        },
        {
            name: 'Configurando TypeScript',
            task: async () => {
                const tsConfig = {
                    "compilerOptions": {
                        "module": "CommonJS",
                        "target": "ESNext",
                        "moduleResolution": "node",
                        "strict": true,
                        "esModuleInterop": true,
                        "experimentalDecorators": true,
                        "emitDecoratorMetadata": true,
                        "preserveConstEnums": true,
                        "noImplicitAny": true,
                        "strictNullChecks": true,
                        "strictFunctionTypes": true,
                        "noImplicitThis": true,
                        "noUnusedLocals": true,
                        "noUnusedParameters": true,
                        "noImplicitReturns": true,
                        "skipLibCheck": true,
                        "noErrorTruncation": true,
                        "outDir": "./dist",
                        "rootDir": "./src",
                        "baseUrl": ".",
                        "stripInternal": true,
                    },
                    "exclude": [
                        "node_modules"
                    ],
                    "include": [
                        "src/**/*"
                    ]
                };
                
                await fs.writeFile(
                    path.join(dir, 'tsconfig.json'),
                    JSON.stringify(tsConfig, null, 2)
                );
            }
        },
        {
            name: 'Creando fichero seyfert.config.mjs',
            task: async () => {
                await fs.writeFile(path.join(dir, 'seyfert.config.mjs'), getFile('seyfert.config.mjs')?.code ?? '');
            }
        },
        {
            name: 'Creando directorio src',
            task: async () => {
                await fs.mkdir(path.join(dir, 'src'));
            }
        },
        {
            name: 'Creando fichero index.ts',
            task: async () => {
                await fs.writeFile(path.join(dir, 'src', 'index.ts'), getFile('index.ts')?.code ?? '');
            }
        },
        {
            name: 'Creando directorio commands',
            task: async () => {
                await fs.mkdir(path.join(dir, 'src', 'commands'));
            }
        },
        {
            name: 'Creando comando test',
            task: async () => {
                await fs.writeFile(path.join(dir, 'src', 'commands', 'test.command.ts'), getFile('test.command.ts')?.code ?? '');
            }
        },
        {
            name: 'Creando directorio events',
            task: async () => {
                await fs.mkdir(path.join(dir, 'src', 'events'));
            }
        },
        {
            name: 'Creando evento ready',
            task: async () => {
                await fs.writeFile(path.join(dir, 'src', 'events', 'ready.ts'), getFile('ready.ts')?.code ?? '');
            }
        },
        {
            name: 'Creando directorio middlewares',
            task: async () => {
                await fs.mkdir(path.join(dir, 'src', 'middlewares'));
            }
        },
        {
            name: 'Creando paquete middleware',
            task: async () => {
                await fs.writeFile(path.join(dir, 'src', 'middlewares', 'middlewares.ts'), getFile('middlewares.ts')?.code ?? '');
            }
        },
        {
            name: 'Creando directorio dist',
            task: async () => {
                await fs.mkdir(path.join(dir, 'dist'));
            }
        },
        {
            name: 'Creando fichero .env',
            task: async () => {
                await fs.writeFile(path.join(dir, '.env'), `BOT_TOKEN="${token? token : 'save_token_here'}"`);
            }
        }
    ];
}