const fs = require('fs');

const filePath = '/run/media/sricharan.adepu/Sri_Charan1/viro-react/ARCarShowcase/assets/models/car.glb';

try {
    const buffer = fs.readFileSync(filePath);

    const magic = buffer.readUInt32LE(0);
    const version = buffer.readUInt32LE(4);
    const length = buffer.readUInt32LE(8);

    if (magic !== 0x46546C67) {
        console.error('Not a valid GLB file');
        process.exit(1);
    }

    const chunkLength = buffer.readUInt32LE(12);
    const chunkType = buffer.readUInt32LE(16);

    if (chunkType !== 0x4E4F534A) {
        console.error('First chunk is not JSON');
        process.exit(1);
    }

    const jsonBuffer = buffer.slice(20, 20 + chunkLength);
    const jsonStr = jsonBuffer.toString('utf8');
    const json = JSON.parse(jsonStr);

    console.log('--- Materials ---');
    if (json.materials) {
        json.materials.forEach((mat, index) => {
            console.log(`${index}: ${mat.name}`);
        });
    } else {
        console.log('No materials found in JSON');
    }

    console.log('\n--- Meshes ---');
    if (json.meshes) {
        json.meshes.forEach((mesh, index) => {
            console.log(`${index}: ${mesh.name}`);
            if (mesh.primitives) {
                mesh.primitives.forEach((prim, pIndex) => {
                    console.log(`  Prim ${pIndex}: Material Index ${prim.material}`);
                });
            }
        });
    }

} catch (err) {
    console.error('Error reading file:', err);
}
