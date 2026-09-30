const fs = require('node:fs/promises');
const { arch } = require('node:os');
const path = require('node:path');

async function main(){
    const comando = process.argv[2];

    const ruta = path.join(__dirname, '..', 'data', 'hiperdeportivos.json');
    const archvios = await fs.readFile(ruta, 'utf8');
    const autos = JSON.parse(archvios);

    if(comando === 'listar'){
        for (const auto of autos ){
            console.log(`${auto.marca} ${auto.modelo}`);
        }
    }else{
        console.log("Usa: node scr/app.js listar");
    }
}

main()