const fs = require('fs');
const path = require('path');

const filePath = './assets/models/car-sample.obj';
const text = fs.readFileSync(filePath, 'utf8');
const lines = text.split('\n');

const objects = {};
let currentObject = 'GLOBAL';
let currentGroup = 'default';
let currentMaterial = 'none';

objects[currentObject] = {
    groups: {},
    materials: new Set(),
    faces: 0
};

function ensureGroup(obj, group) {
    if (!objects[obj].groups[group]) {
        objects[obj].groups[group] = {
            faces: 0,
            materials: new Set()
        };
    }
}

for (let raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('o ')) {
        currentObject = line.slice(2).trim();
        objects[currentObject] ??= { groups: {}, materials: new Set(), faces: 0 };
        currentGroup = 'default';
        ensureGroup(currentObject, currentGroup);
    }

    else if (line.startsWith('g ')) {
        currentGroup = line.slice(2).trim() || 'default';
        ensureGroup(currentObject, currentGroup);
    }

    else if (line.startsWith('usemtl ')) {
        currentMaterial = line.slice(7).trim();
        objects[currentObject].materials.add(currentMaterial);
        objects[currentObject].groups[currentGroup].materials.add(currentMaterial);
    }

    else if (line.startsWith('f ')) {
        objects[currentObject].faces++;
        ensureGroup(currentObject, currentGroup);
        objects[currentObject].groups[currentGroup].faces++;
    }
}

console.log('\n--- OBJ OBJECT / GROUP / MATERIAL INSPECTION ---');

for (const [objName, obj] of Object.entries(objects)) {
    console.log(`\nObject "${objName}"`);
    console.log(`  Total Faces: ${obj.faces}`);
    console.log(`  Materials Used: ${[...obj.materials].join(', ') || 'none'}`);

    for (const [grpName, grp] of Object.entries(obj.groups)) {
        console.log(`    Group "${grpName}"`);
        console.log(`      Faces: ${grp.faces}`);
        console.log(`      Materials: ${[...grp.materials].join(', ') || 'none'}`);
    }
}
