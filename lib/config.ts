

export const apiBase = '/api/';

export const getImageUrl = (id: number) => {
    return apiBase + 'im/' + id;
};

export function isSubdomain(url: string) {
    const regex = new RegExp(/^([a-z]+\:\/{2})?([\w-]+\.[\w-]+\.\w+)$/);
    return !!url.match(regex);
}

export let perPage = 40;

export const changePerPage = (newPerPage: number) => {
    perPage = newPerPage;
};

function getEnv() {
    let isDevelopment1 = false;
    let isStaging1 = false;

    // initialilze the environment
    if (typeof window === 'undefined') {
        if (process.env.ENV === 'development') {
            isDevelopment1 = true;
            isStaging1 = false;
        } else if (process.env.ENV === 'staging') {
            isDevelopment1 = false;
            isStaging1 = true;
        } else {
            isDevelopment1 = false;
            isStaging1 = false;
        }

    } else {
        let url = window.location.href;
        if (url.includes('localhost')) {
            isDevelopment1 = true;
            isStaging1 = false;
        } else if (url.includes('192')) {
            isDevelopment1 = true;
            isStaging1 = false;
        } else if (url.includes('staging')) {
            isDevelopment1 = false;
            isStaging1 = true;
        } else if (isSubdomain(url)) {
            isStaging1 = true;
            isDevelopment1 = false;
        } else {
            isStaging1 = false;
            isDevelopment1 = false;
        }
    }

    return {
        isDev: isDevelopment1,
        isStaging: isStaging1
    }
}

export const isDevelopment = getEnv().isDev;
export const isStaging = getEnv().isStaging;
export const isProduction = !isDevelopment && !isStaging;

if (typeof window === 'undefined') {
    console.log('isDevelopment', isDevelopment);
    console.log('isStaging', isStaging);
    console.log('db url', process.env.DATABASE_URL);
    console.log('zoho user', process.env.ZOHO_USER);
}

export const devPort = 3000;
export const isForceSMS = !isDevelopment;
export const isValidateSMS = !( isDevelopment || isStaging );

export const mobilePrefix = '+65';

export const disableEmail = isDevelopment;

// tawkto api keys
export const tawkConfig = {
    tawkId: '1fbdj5c53',
    propertyId: '60fcb901649e0a0a5ccdcdf6',
};
