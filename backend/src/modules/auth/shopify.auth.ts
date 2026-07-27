import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'crypto';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// -------------------------------------------------------
// Shopify OAuth 2.0 Flow — Production-grade implementation
// -------------------------------------------------------
// STEP 1: Browser visits /api/v1/auth/shopify/install
//         → We redirect them to Shopify's authorization URL
// STEP 2: Shopify redirects back to /api/v1/auth/shopify/callback
//         → We verify the HMAC signature (security check!)
//         → We exchange the code for a permanent access token
//         → We print the token to the terminal (save it in .env)
// -------------------------------------------------------

const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP!;       // e.g. adeaur.myshopify.com
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;  // From Dev Dashboard Settings
const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET!;     // From Dev Dashboard Settings
const SHOPIFY_SCOPES = 'read_orders,read_all_orders,read_customers,read_products,read_inventory,read_fulfillments,read_shipping';
const REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI!; // e.g. http://localhost:5000/api/v1/auth/shopify/callback

/**
 * Verifies the HMAC signature that Shopify sends with every callback.
 * This is a CRITICAL security step — it proves the request genuinely came from Shopify.
 * Never skip this in production.
 */
function verifyShopifyHmac(query: Record<string, string>): boolean {
    const { hmac, ...rest } = query;
    if (!hmac) return false;

    const message = Object.keys(rest)
        .sort()
        .map((key) => `${key}=${rest[key]}`)
        .join('&');

    const computedHmac = crypto
        .createHmac('sha256', SHOPIFY_SECRET)
        .update(message)
        .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(computedHmac), Buffer.from(hmac));
}

/**
 * Exchanges the temporary OAuth code for a permanent access token.
 * This token starts with 'shpat_...' and should be stored in .env immediately.
 */
function exchangeCodeForToken(shop: string, code: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            client_id: SHOPIFY_CLIENT_ID,
            client_secret: SHOPIFY_SECRET,
            code,
        });

        const options = {
            hostname: shop,
            path: '/admin/oauth/access_token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res: any) => {
            let data = '';
            res.on('data', (chunk: any) => (data += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.access_token) {
                        resolve(parsed.access_token);
                    } else {
                        reject(new Error(`Token exchange failed: ${data}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

export async function shopifyAuthRoutes(fastify: FastifyInstance) {
    /**
     * ROUTE 1: Initiate the OAuth flow.
     * Visit this in your browser to start the Shopify authorization process.
     */
    fastify.get('/api/v1/auth/shopify/install', async (req: FastifyRequest, reply: FastifyReply) => {
        // Generate a cryptographically random state to prevent CSRF attacks
        const state = crypto.randomBytes(16).toString('hex');

        const installUrl =
            `https://${SHOPIFY_SHOP}/admin/oauth/authorize` +
            `?client_id=${SHOPIFY_CLIENT_ID}` +
            `&scope=${SHOPIFY_SCOPES}` +
            `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&state=${state}`;

        fastify.log.info(`[Shopify OAuth] Redirecting to: ${installUrl}`);
        return reply.redirect(installUrl);
    });

    /**
     * ROUTE 2: Handle Shopify's callback after the merchant authorizes.
     * Shopify sends us a temporary 'code'. We exchange it for a permanent access token.
     */
    fastify.get('/api/v1/auth/shopify/callback', async (req: FastifyRequest, reply: FastifyReply) => {
        const query = req.query as Record<string, string>;
        const { shop, code } = query;

        // SECURITY: Verify HMAC before doing anything else
        if (!verifyShopifyHmac(query)) {
            fastify.log.error('[Shopify OAuth] HMAC verification FAILED — potential tampering detected!');
            return reply.status(401).send({ error: 'HMAC verification failed. Request rejected.' });
        }

        fastify.log.info(`[Shopify OAuth] HMAC verified. Exchanging code for token for shop: ${shop}`);

        try {
            const accessToken = await exchangeCodeForToken(shop, code);

            // ✅ SUCCESS: Token received. Automatically save it to .env.
            const envPath = path.resolve(process.cwd(), '.env');
            let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

            if (envContent.includes('SHOPIFY_ACCESS_TOKEN=')) {
                envContent = envContent.replace(
                    /SHOPIFY_ACCESS_TOKEN=.*/,
                    `SHOPIFY_ACCESS_TOKEN=${accessToken}`
                );
            } else {
                envContent += `\nSHOPIFY_ACCESS_TOKEN=${accessToken}\n`;
            }

            fs.writeFileSync(envPath, envContent, 'utf8');

            fastify.log.info('✅ SHOPIFY_ACCESS_TOKEN automatically saved to .env file!');

            return reply.status(200).send({
                success: true,
                message: 'Shopify app installed successfully! The backend token is saved in .env. You can close this window now.',
                shop,
            });
        } catch (err: any) {
            fastify.log.error(`[Shopify OAuth] Token exchange error: ${err.message}`);
            return reply.status(500).send({ error: 'Failed to exchange token. See server logs.' });
        }
    });
}
