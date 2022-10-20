
const fs = require('fs');
const envPath = './.env';

// if .env file exists
if (!fs.existsSync(envPath)) {
    // const DATABASE_URL = process.env.DATABASE_URL;
    // const ZOHO_USER = process.env.ZOHO_USER;
    // const ZOHO_PASS = process.env.ZOHO_PASS;
    // const NEW_ORDER_EMAIL = process.env.NEW_ORDER_EMAIL;
    // const ENV = process.env.ENV;

    const DATABASE_URL="postgresql://postgres:jilla1929@localhost:5432/neat-kitch?schema=public"
    const NEW_ORDER_EMAIL="info@promosolutions.lk"
    const ZOHO_PASS="1234promo1234"
    const ZOHO_USER="info@promosolutions.lk"
    const ENV="staging"

    let env = '';
    if (DATABASE_URL) {
        env += `DATABASE_URL="${DATABASE_URL}"\n`;
    }
    if (ZOHO_USER) {
        env += `ZOHO_USER="${ZOHO_USER}"\n`;
    }
    if (ZOHO_PASS) {
        env += `ZOHO_PASS="${ZOHO_PASS}"\n`;
    }
    if (NEW_ORDER_EMAIL) {
        env += `NEW_ORDER_EMAIL="${NEW_ORDER_EMAIL}"\n`;
    }
    if (ENV) {
        env += `ENV="${ENV}"\n`;
    }

    if (env) {
        fs.writeFileSync(envPath, env);
    }
}
