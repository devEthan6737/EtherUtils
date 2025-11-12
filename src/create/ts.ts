import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { ProgressTask } from 'src/utils';
const execAsync = promisify(exec);

export function createTS (dir: string): ProgressTask[] {
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
                await execAsync(`npm install typescript dotenv ts-node @types/node`, { cwd: dir });
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
            name: 'Creando directorio src',
            task: async () => {
                await fs.mkdir(path.join(dir, 'src'));
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
                await fs.writeFile(path.join(dir, '.env'), '');
            }
        }
    ];
}