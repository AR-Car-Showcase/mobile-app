const fs = require('fs');

const filePath = './assets/models/car.glb';

try {
    const buffer = fs.readFileSync(filePath);

    const magic = buffer.readUInt32LE(0);
    const chunkLength = buffer.readUInt32LE(12);
    const jsonBuffer = buffer.slice(20, 20 + chunkLength);
    const json = JSON.parse(jsonBuffer.toString('utf8'));

    function findNodesByNames(names) {
        const results = [];
        json.nodes.forEach((node, idx) => {
            if (node.name && names.some(name => node.name.includes(name))) {
                results.push({ idx, ...node });
            }
        });
        return results;
    }

    function getHierarchy(nodeIdx, level = 0) {
        const node = json.nodes[nodeIdx];
        let info = '  '.repeat(level) + `- Node ${nodeIdx}: "${node.name}" (Mesh: ${node.mesh !== undefined ? node.mesh : 'none'})\n`;
        if (node.mesh !== undefined) {
            const mesh = json.meshes[node.mesh];
            mesh.primitives.forEach((prim, pIdx) => {
                info += '  '.repeat(level + 1) + `* Primitive ${pIdx} uses Material ${prim.material}\n`;
            });
        }
        if (node.children) {
            node.children.forEach(childIdx => {
                info += getHierarchy(childIdx, level + 1);
            });
        }
        return info;
    }

    const targetedNames = ['Object_46_46_93', 'Object_46_46_94', 'Object_94_94'];
    const found = findNodesByNames(targetedNames);

    console.log('--- Deep Hierarchy Inspection ---');
    found.forEach(f => {
        console.log(`\nRoot search match found: Node ${f.idx}`);
        console.log(getHierarchy(f.idx));
    });


    console.log('\n--- Root Nodes ---');
    const hasParent = new Set();
    json.nodes.forEach(node => {
        if (node.children) {
            node.children.forEach(c => hasParent.add(c));
        }
    });

    json.nodes.forEach((node, idx) => {
        if (!hasParent.has(idx) && node.children) {
            console.log(`Potential Global Root Node ${idx}: "${node.name}"`);
        }
    });


    console.log('\n--- Final Materials to Mesh/Primitive Mapping ---');
    let globalPrimCounter = 0;
    json.meshes.forEach((mesh, mIdx) => {
        mesh.primitives.forEach((prim, pIdx) => {
            const matName = json.materials[prim.material] ? json.materials[prim.material].name : 'unknown';
            console.log(`${globalPrimCounter}: Mesh ${mIdx} ("${mesh.name}"), Prim ${pIdx} -> Material ${prim.material} ("${matName}")`);
            globalPrimCounter++;
        });
    });

} catch (err) {
    console.error('Error:', err);
}
