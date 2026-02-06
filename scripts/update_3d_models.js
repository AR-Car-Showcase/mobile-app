#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, '../assets/cars_data.json');
const carsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Model mappings: brand-model -> filename
const modelMappings = {
    'mahindra-scorpio-n': 'mahindra-scorpio-n.glb',
    'maruti-baleno': 'maruti-baleno.glb',
    'maruti-brezza': 'maruti-brezza.glb',
    // Future models (not in JSON yet, but files exist)
    // 'audi-r8': 'audi-r8.glb',
    // 'honda-crv': 'honda-crv.glb',
    // 'honda-integra': 'honda-integra.glb',
    // 'mercedes-amg-gtr': 'mercedes-amg-gtr.glb',
    // 'mercedes-s-class': 'mercedes-s-class.glb',
    // 'bugatti-chiron': 'bugatti-chiron.glb',
};

// Update cars with 3D models
let updatedCount = 0;
carsData.forEach(car => {
    const key = `${car.brand}-${car.model}`;
    if (modelMappings[key]) {
        car.model_3d = modelMappings[key];
        updatedCount++;
        console.log(`✓ Added model to: ${car.brand} ${car.model} -> ${modelMappings[key]}`);
    }
});

// Write back to file
fs.writeFileSync(jsonPath, JSON.stringify(carsData, null, 2), 'utf8');

console.log(`\n✅ Updated ${updatedCount} cars with 3D models`);
console.log(`📝 Updated file: ${jsonPath}`);
