
export const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.toLowerCase().replace(/rs\.|,/g, '').trim();

    // Handle ranges like "10 - 20 Lakh" -> take average or min? Let's take min for "starts from" logic
    // But comparison usually favors lower price, so let's parse the first number found.
    // actually, for comparison, a specific variant price is best, but we only have range. 
    // Let's use the lower bound of the range for simplicty, or handle "Cr" and "Lakh"

    const parts = cleanStr.split('-');
    const firstPart = parts[0].trim();

    const numberMatch = firstPart.match(/[\d\.]+/);
    if (!numberMatch) return 0;

    let amount = parseFloat(numberMatch[0]);

    if (cleanStr.includes('cr')) {
        amount = amount * 100; // Convert to Lakhs
    }

    return amount;
};

export const parseEngine = (engineStr: string): number => {
    if (!engineStr) return 0;
    const match = engineStr.match(/(\d+)\s*cc/i);
    return match ? parseInt(match[1]) : 0;
};

export const parsePower = (powerStr: string): number => {
    if (!powerStr) return 0;
    // Matches "113 bhp", "150 hp", etc.
    const match = powerStr.match(/(\d+(\.\d+)?)\s*(bhp|hp|ps)/i);
    return match ? parseFloat(match[1]) : 0;
};

export const parseMileage = (mileageStr: string): number => {
    if (!mileageStr) return 0;
    // Matches "20.1 kmpl", "15 km/l"
    const match = mileageStr.match(/(\d+(\.\d+)?)\s*(kmpl|km\/l)/i);
    return match ? parseFloat(match[1]) : 0;
};

export const parseTorque = (torqueStr: string): number => {
    if (!torqueStr) return 0;
    // Matches "250 Nm"
    const match = torqueStr.match(/(\d+(\.\d+)?)\s*nm/i);
    return match ? parseFloat(match[1]) : 0;
};

type ComparisonResult = 'best' | 'worst' | 'neutral';

export const compareSpecs = (
    value1: string | number,
    value2: string | number,
    type: 'price' | 'engine' | 'power' | 'mileage' | 'torque' | 'rating'
): ComparisonResult => {
    // This is a simplified helper, real comparison happens on the whole array usually
    return 'neutral';
};

export const findBestValue = (values: string[], type: 'price' | 'engine' | 'power' | 'mileage' | 'torque' | 'rating'): number => {
    // Returns the index of the best value
    const parsedValues = values.map(v => {
        if (!v) return -1;
        switch (type) {
            case 'price': return parsePrice(v);
            case 'engine': return parseEngine(v);
            case 'power': return parsePower(v);
            case 'mileage': return parseMileage(v);
            case 'torque': return parseTorque(v);
            case 'rating': return parseFloat(v) || 0;
            default: return 0;
        }
    });

    let bestIndex = -1;
    let bestVal = -1;

    // For price, lower is better. For others, higher is better.
    if (type === 'price') {
        let minVal = Number.MAX_VALUE;
        parsedValues.forEach((val, idx) => {
            if (val > 0 && val < minVal) {
                minVal = val;
                bestIndex = idx;
            }
        });
    } else {
        let maxVal = -1;
        parsedValues.forEach((val, idx) => {
            if (val > maxVal) {
                maxVal = val;
                bestIndex = idx;
            }
        });
    }

    return bestIndex;
};
