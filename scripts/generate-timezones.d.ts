declare module 'tz-lookup' {
    function tzlookup(lat: number, lng: number): string;
    export = tzlookup;
}

declare module 'cities.json' {
    interface City {
        name: string;
        lat: string;
        lng: string;
        country: string;
        population?: number;
    }
    const cities: City[];
    export default cities;
}
