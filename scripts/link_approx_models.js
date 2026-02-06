#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, '../assets/cars_data.json');
const carsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Exact and Approx Mappings
const brandMappings = {
    // Specific models (already done, but good to keep)
    'mahindra-scorpio-n': 'mahindra-scorpio-n.glb',
    'maruti-baleno': 'maruti-baleno.glb',
    'maruti-brezza': 'maruti-brezza.glb',

    // Brand/Model approx mappings
    'honda-cr-v': 'honda-crv.glb', // Verify model name in json
    'bugatti-chiron': 'bugatti-chiron.glb',
};

// General fallback strategy for brands if specific model match fails? 
// User said "rename the .glb file to approx cars in the json"
// So if I have 'audi-r8.glb', I should map it to 'audi r8' if it exists.
// I have 'mercedes-amg-gtr.glb', map to 'mercedes ...' 

// Let's iterate and try to find best matches.

let updatedCount = 0;

carsData.forEach(car => {
    const brand = car.brand.toLowerCase();
    const model = car.model.toLowerCase();
    const key = `${brand}-${model}`;

    let model3d = null;

    // Direct Exact Matches (from previous step + new ones)
    if (key === 'mahindra-scorpio-n') model3d = 'mahindra-scorpio-n.glb';
    else if (key === 'maruti-baleno') model3d = 'maruti-baleno.glb';
    else if (key === 'maruti-brezza') model3d = 'maruti-brezza.glb';

    // Approx Matches
    else if (brand === 'audi' && model.includes('r8')) model3d = 'audi-r8.glb';
    else if (brand === 'honda' && (model.includes('cr-v') || model.includes('crv'))) model3d = 'honda-crv.glb';
    else if (brand === 'honda' && model.includes('integra')) model3d = 'honda-integra.glb';
    else if (brand.includes('mercedes') && model.includes('amg')) model3d = 'mercedes-amg-gtr.glb';
    else if (brand.includes('mercedes') && model.includes('s-class')) model3d = 'mercedes-s-class.glb';
    else if (brand === 'bugatti') model3d = 'bugatti-chiron.glb';

    if (model3d) {
        car.model_3d = model3d;
        updatedCount++;
        console.log(`✓ Linked: ${car.brand} ${car.model} -> ${model3d}`);
    }
});

// Write back to file
fs.writeFileSync(jsonPath, JSON.stringify(carsData, null, 2), 'utf8');

console.log(`\n✅ Updated ${updatedCount} cars with 3D models`);
