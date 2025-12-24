import fs from 'fs';
import tzlookup from 'tz-lookup';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json' assert { type: 'json' };

// Register English locale for country name resolution
countries.registerLocale(enLocale);

interface CityEntry {
    name: string;
    lat: string;
    lng: string;
    country: string;
    population?: number;
}

interface CityTimezone {
    city: string;
    country: string;
    countryCode: string;
    timezone: string;
    lat: number;
    lng: number;
}

// Manual list of major world cities with coordinates (to ensure they're always included)
const MANUAL_MAJOR_CITIES: Array<{ name: string; lat: number; lng: number; country: string }> = [
    // Asia
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'JP' },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, country: 'IN' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'IN' },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, country: 'IN' },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, country: 'IN' },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, country: 'IN' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, country: 'IN' },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, country: 'IN' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, country: 'IN' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, country: 'IN' },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737, country: 'CN' },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'CN' },
    { name: 'Guangzhou', lat: 23.1291, lng: 113.2644, country: 'CN' },
    { name: 'Shenzhen', lat: 22.5431, lng: 114.0579, country: 'CN' },
    { name: 'Chengdu', lat: 30.5728, lng: 104.0668, country: 'CN' },
    { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'HK' },
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'KR' },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'TH' },
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456, country: 'ID' },
    { name: 'Manila', lat: 14.5995, lng: 120.9842, country: 'PH' },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'SG' },
    { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, country: 'MY' },
    { name: 'Hanoi', lat: 21.0285, lng: 105.8542, country: 'VN' },
    { name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297, country: 'VN' },
    { name: 'Dhaka', lat: 23.8103, lng: 90.4125, country: 'BD' },
    { name: 'Karachi', lat: 24.8607, lng: 67.0011, country: 'PK' },
    { name: 'Lahore', lat: 31.5497, lng: 74.3436, country: 'PK' },
    { name: 'Islamabad', lat: 33.6844, lng: 73.0479, country: 'PK' },
    { name: 'Osaka', lat: 34.6937, lng: 135.5023, country: 'JP' },
    { name: 'Taipei', lat: 25.0330, lng: 121.5654, country: 'TW' },

    // Middle East
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'AE' },
    { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, country: 'AE' },
    { name: 'Riyadh', lat: 24.7136, lng: 46.6753, country: 'SA' },
    { name: 'Jeddah', lat: 21.5433, lng: 39.1728, country: 'SA' },
    { name: 'Tehran', lat: 35.6892, lng: 51.3890, country: 'IR' },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784, country: 'TR' },
    { name: 'Ankara', lat: 39.9334, lng: 32.8597, country: 'TR' },
    { name: 'Baghdad', lat: 33.3152, lng: 44.3661, country: 'IQ' },
    { name: 'Tel Aviv', lat: 32.0853, lng: 34.7818, country: 'IL' },
    { name: 'Jerusalem', lat: 31.7683, lng: 35.2137, country: 'IL' },
    { name: 'Doha', lat: 25.2854, lng: 51.5310, country: 'QA' },
    { name: 'Kuwait City', lat: 29.3759, lng: 47.9774, country: 'KW' },
    { name: 'Muscat', lat: 23.5880, lng: 58.3829, country: 'OM' },
    { name: 'Beirut', lat: 33.8886, lng: 35.4955, country: 'LB' },
    { name: 'Amman', lat: 31.9454, lng: 35.9284, country: 'JO' },

    // Europe
    { name: 'London', lat: 51.5074, lng: -0.1278, country: 'GB' },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'FR' },
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'DE' },
    { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'ES' },
    { name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'IT' },
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041, country: 'NL' },
    { name: 'Brussels', lat: 50.8503, lng: 4.3517, country: 'BE' },
    { name: 'Vienna', lat: 48.2082, lng: 16.3738, country: 'AT' },
    { name: 'Athens', lat: 37.9838, lng: 23.7275, country: 'GR' },
    { name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'RU' },
    { name: 'Saint Petersburg', lat: 59.9343, lng: 30.3351, country: 'RU' },
    { name: 'Warsaw', lat: 52.2297, lng: 21.0122, country: 'PL' },
    { name: 'Prague', lat: 50.0755, lng: 14.4378, country: 'CZ' },
    { name: 'Budapest', lat: 47.4979, lng: 19.0402, country: 'HU' },
    { name: 'Stockholm', lat: 59.3293, lng: 18.0686, country: 'SE' },
    { name: 'Copenhagen', lat: 55.6761, lng: 12.5683, country: 'DK' },
    { name: 'Oslo', lat: 59.9139, lng: 10.7522, country: 'NO' },
    { name: 'Helsinki', lat: 60.1699, lng: 24.9384, country: 'FI' },
    { name: 'Dublin', lat: 53.3498, lng: -6.2603, country: 'IE' },
    { name: 'Lisbon', lat: 38.7223, lng: -9.1393, country: 'PT' },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734, country: 'ES' },
    { name: 'Milan', lat: 45.4642, lng: 9.1900, country: 'IT' },
    { name: 'Munich', lat: 48.1351, lng: 11.5820, country: 'DE' },
    { name: 'Zurich', lat: 47.3769, lng: 8.5417, country: 'CH' },
    { name: 'Geneva', lat: 46.2044, lng: 6.1432, country: 'CH' },

    // Americas
    { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'US' },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'US' },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298, country: 'US' },
    { name: 'Houston', lat: 29.7604, lng: -95.3698, country: 'US' },
    { name: 'Phoenix', lat: 33.4484, lng: -112.0740, country: 'US' },
    { name: 'Philadelphia', lat: 39.9526, lng: -75.1652, country: 'US' },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936, country: 'US' },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611, country: 'US' },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970, country: 'US' },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194, country: 'US' },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321, country: 'US' },
    { name: 'Boston', lat: 42.3601, lng: -71.0589, country: 'US' },
    { name: 'Miami', lat: 25.7617, lng: -80.1918, country: 'US' },
    { name: 'Washington', lat: 38.9072, lng: -77.0369, country: 'US' },
    { name: 'Atlanta', lat: 33.7490, lng: -84.3880, country: 'US' },
    { name: 'Denver', lat: 39.7392, lng: -104.9903, country: 'US' },
    { name: 'Las Vegas', lat: 36.1699, lng: -115.1398, country: 'US' },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'CA' },
    { name: 'Montreal', lat: 45.5017, lng: -73.5673, country: 'CA' },
    { name: 'Vancouver', lat: 49.2827, lng: -123.1207, country: 'CA' },
    { name: 'Calgary', lat: 51.0447, lng: -114.0719, country: 'CA' },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'MX' },
    { name: 'Guadalajara', lat: 20.6597, lng: -103.3496, country: 'MX' },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'BR' },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, country: 'BR' },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'AR' },
    { name: 'Lima', lat: -12.0464, lng: -77.0428, country: 'PE' },
    { name: 'Bogotá', lat: 4.7110, lng: -74.0721, country: 'CO' },
    { name: 'Santiago', lat: -33.4489, lng: -70.6693, country: 'CL' },

    // Africa
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'EG' },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, country: 'NG' },
    { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, country: 'ZA' },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'ZA' },
    { name: 'Nairobi', lat: -1.2864, lng: 36.8172, country: 'KE' },
    { name: 'Casablanca', lat: 33.5731, lng: -7.5898, country: 'MA' },
    { name: 'Addis Ababa', lat: 9.0320, lng: 38.7469, country: 'ET' },
    { name: 'Accra', lat: 5.6037, lng: -0.1870, country: 'GH' },

    // Oceania
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'AU' },
    { name: 'Melbourne', lat: -37.8136, lng: 144.9631, country: 'AU' },
    { name: 'Brisbane', lat: -27.4698, lng: 153.0251, country: 'AU' },
    { name: 'Perth', lat: -31.9505, lng: 115.8605, country: 'AU' },
    { name: 'Adelaide', lat: -34.9285, lng: 138.6007, country: 'AU' },
    { name: 'Auckland', lat: -36.8485, lng: 174.7633, country: 'NZ' },
    { name: 'Wellington', lat: -41.2865, lng: 174.7762, country: 'NZ' },
];

async function generateTimezones() {
    // Dynamically import cities.json
    const citiesModule = await import('cities.json', { assert: { type: 'json' } });
    const citiesData = citiesModule.default as CityEntry[];

    console.log('🌍 Starting timezone generation...');
    console.log(`📊 Processing ${citiesData.length} cities from database`);

    const result: CityTimezone[] = [];
    const addedCities = new Set<string>(); // Track added cities to avoid duplicates
    const perCountryCount: Record<string, number> = {};

    // Major countries get 1500+ cities, others get 400+
    const MAJOR_COUNTRIES = ['United States', 'China', 'India', 'United Kingdom', 'Japan', 'Germany', 'France', 'Brazil', 'Russia', 'Canada', 'Australia', 'Italy', 'Spain', 'Mexico', 'Indonesia', 'South Korea', 'Turkey', 'Saudi Arabia'];
    const MAX_CITIES_MAJOR_COUNTRIES = 1500;
    const MAX_CITIES_OTHER_COUNTRIES = 400;

    const getMaxCitiesForCountry = (countryName: string): number => {
        return MAJOR_COUNTRIES.includes(countryName) ? MAX_CITIES_MAJOR_COUNTRIES : MAX_CITIES_OTHER_COUNTRIES;
    };

    // First, add all manual major cities
    console.log('🏙️  Adding major cities...');
    for (const city of MANUAL_MAJOR_CITIES) {
        try {
            const timezone = tzlookup(city.lat, city.lng);
            const countryName = countries.getName(city.country, 'en');
            if (!countryName) continue;

            const cityKey = `${city.name}-${countryName}`.toLowerCase();
            if (addedCities.has(cityKey)) continue;

            result.push({
                city: city.name,
                country: countryName,
                countryCode: city.country,
                timezone,
                lat: city.lat,
                lng: city.lng,
            });

            addedCities.add(cityKey);
            perCountryCount[countryName] = (perCountryCount[countryName] || 0) + 1;
        } catch (error) {
            console.warn(`⚠️  Failed to add ${city.name}: ${error}`);
        }
    }

    console.log(`✅ Added ${result.length} major cities`);
    console.log('📊 Adding additional cities from database...');

    // Sort remaining cities by population (descending)
    const sortedCities = [...citiesData].sort((a, b) => {
        const popA = a.population || 0;
        const popB = b.population || 0;
        return popB - popA;
    });

    // Then add cities from database to fill up to MAX_CITIES_PER_COUNTRY
    for (const city of sortedCities) {
        if (!city.lat || !city.lng) continue;

        const lat = parseFloat(city.lat);
        const lng = parseFloat(city.lng);

        if (isNaN(lat) || isNaN(lng)) continue;

        const countryName = countries.getName(city.country, 'en');
        if (!countryName) continue;

        // Check if we've reached the limit for this country
        perCountryCount[countryName] ||= 0;
        const maxCities = getMaxCitiesForCountry(countryName);
        if (perCountryCount[countryName] >= maxCities) continue;

        const cityKey = `${city.name}-${countryName}`.toLowerCase();
        if (addedCities.has(cityKey)) continue;

        try {
            const timezone = tzlookup(lat, lng);

            result.push({
                city: city.name,
                country: countryName,
                countryCode: city.country,
                timezone,
                lat: lat,
                lng: lng,
            });

            addedCities.add(cityKey);
            perCountryCount[countryName]++;
        } catch (error) {
            continue;
        }
    }

    // Sort by country, then by city name
    result.sort((a, b) => {
        if (a.country !== b.country) {
            return a.country.localeCompare(b.country);
        }
        return a.city.localeCompare(b.city);
    });

    // Generate TypeScript file
    const output = `// Auto-generated by scripts/generate-timezones.ts
// Do not edit this file manually
// Run: npx tsx scripts/generate-timezones.ts to regenerate

export interface CityTimezone {
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
  lat: number;
  lng: number;
}

export const TIMEZONES: CityTimezone[] = ${JSON.stringify(result, null, 2)};
`;

    // Write to file
    const outputPath = 'src/data/timezones.ts';
    fs.writeFileSync(outputPath, output, 'utf-8');

    console.log(`✅ Generated ${result.length} total cities`);
    console.log(`📍 Countries covered: ${Object.keys(perCountryCount).length}`);
    console.log(`🏙️  Major cities: ${MANUAL_MAJOR_CITIES.length}`);
    console.log(`💾 Written to: ${outputPath}`);
    console.log('🎉 Done!');
}

generateTimezones().catch(console.error);
