export interface ICountry {
    pk: number;
    fields: {
        name: string;
        official_name?: string;
        alpha2_code: string;
        alpha3_code: string;
        capital?: string;
        region?: string;
        subregion?: string;
        population?: number;
        area?: number;
        timezones?: string[]; // Assuming timezones is an array of strings
        borders?: string[]; // Assuming borders is an array of strings (could be country codes)
        currencies?: { [key: string]: any }; // Assuming currencies is an object where keys are currency codes or names
        languages?: { [key: string]: any }; // Assuming languages is an object where keys are language codes or names
        flag?: string;
    }
}