import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { ProgressBar } from './utils';
import { createTS } from './create/ts';
import { createSeyfert } from './create/seyfert/seyfert';
import { terminal } from 'terminal-kit';
import { exec } from 'child_process';
import { tmpdir } from 'os';

const program = new Command();

program.name('eth').version('1.0.0').description('EtherUtils CLI');

program
    .command('create <name> <path>')
    .description('Crea un proyecto base')
    .action(async (name, p) => {
        const options: string[] = [ "seyfert", "ts" ];
        if (!options.includes(name)) {
            console.error(`${name} no es una opción válida. Opciones válidas: ${options.join(', ')}`);
            process.exit(1);
        }

        const dir = path.resolve(process.cwd(), p);

        try {
            await fs.access(dir);
            terminal('Ese directorio ya existe,').red(' ¿escribir ahí?').gray(' [Y/n]');
            const choice = await terminal.yesOrNo({
                yes: [ 'y' , 'Y' , 's' , 'S' ],
                no: [ 'n' , 'N' ]
            }).promise;

            terminal('\n');

            if (!choice) process.exit(1);
        } catch (error) {}

        const progress = new ProgressBar(`📦 Creando proyecto: ${name}`, name === 'seyfert' ? await createSeyfert(dir) : createTS(dir));

        progress.onComplete(() => {
            console.log('✅ Proyecto creado exitosamente!');
            console.log(`📁 Directorio: ${dir}`);
            process.exit(1);
        });

        await progress.start();
    });

program
    .command('install <pkg>')
    .description('Instala paquetes')
    .action((pkg) => {
        if (pkg === 'node') {
            terminal('Elige versión: ');
            const history = ['node v24.11.1', 'node v22.21.1', 'node v20.11.0'];

            terminal.inputField({
                history,
                autoComplete: history,
                autoCompleteMenu: true
            }, (error, input): any => {
                if (error) return terminal.red.bold("\nError: " + error + "\n");

                if (!history.includes(input ?? '')) return terminal.red('\nValor no esperado.\n');

                const version = input?.split(' ')[1];
                const url = `https://nodejs.org/dist/${version}/node-${version}-x64.msi`;
                const output = path.join(tmpdir(), `node-${version}-x64.msi`);

                terminal.green(`\nDescargando Node ${version}...\n`);

                exec(`powershell -Command "Invoke-WebRequest '${url}' -OutFile '${output}'"`, (err): any => {
                    if (err) return terminal.red(`\nError descargando Node: ${err.message}\n`);

                    terminal.green(`\nInstalando Node ${version}...\n`);

                    exec(`powershell -Command "Start-Process '${output}' -Wait"`, (err2) => {
                        if (err2) return terminal.red(`\nError al instalar Node: ${err2.message}\n`);

                        terminal.green(`\nNode ${version} instalado correctamente.\n`);
                        process.exit(1);
                    });
                });
            });
        } else console.log(`No hay instalador definido para: ${pkg}`);
    });


program.parse();