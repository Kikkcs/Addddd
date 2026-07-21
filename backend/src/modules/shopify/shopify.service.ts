import * as https from 'https';

export class ShopifyService {
    private static instance: ShopifyService;
    private readonly shopDomain: string;
    private readonly accessToken: string;
    private readonly apiVersion = '2023-10'; // Stable version

    private constructor() {
        this.shopDomain = process.env.SHOPIFY_SHOP || '';
        this.accessToken = process.env.SHOPIFY_ACCESS_TOKEN || '';
    }

    public static getInstance(): ShopifyService {
        if (!ShopifyService.instance) {
            ShopifyService.instance = new ShopifyService();
        }
        return ShopifyService.instance;
    }

    /**
     * Helper function to perform authenticated GET requests to Shopify REST API.
     */
    private async get(endpoint: string): Promise<any> {
        if (!this.accessToken) {
            throw new Error('Shopify Access Token is missing. Run the OAuth flow first.');
        }

        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.shopDomain,
                path: `/admin/api/${this.apiVersion}/${endpoint}`,
                method: 'GET',
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode && res.statusCode >= 400) {
                            reject(new Error(`Shopify API Error (${res.statusCode}): ${JSON.stringify(parsed)}`));
                        } else {
                            resolve(parsed);
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse Shopify response: ${data}`));
                    }
                });
            });

            req.on('error', (err) => reject(new Error(`Network error calling Shopify: ${err.message}`)));
            req.end();
        });
    }

    private cachePromise: Promise<any[]> | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_TTL_MS = 60000; // 60 seconds

    /**
     * Fetch recent active orders from Shopify
     */
    public async getRecentOrders(limit: number = 50): Promise<any[]> {
        const now = Date.now();
        // If a request is already in-flight or was completed recently, return the cached promise
        if (this.cachePromise && (now - this.cacheTimestamp) < this.CACHE_TTL_MS) {
            return this.cachePromise;
        }

        this.cacheTimestamp = now;
        this.cachePromise = (async () => {
            try {
                let allOrders: any[] = [];
                let sinceId = 0;
                let hasMore = true;

                while (hasMore && allOrders.length < limit) {
                    const response = await this.get(`orders.json?status=any&limit=250&since_id=${sinceId}`);
                    const batch = response.orders || [];

                    if (batch.length === 0) {
                        hasMore = false;
                    } else {
                        allOrders = allOrders.concat(batch);
                        // The array is returned ascending with since_id. Grab the largest ID.
                        const maxId = batch[batch.length - 1].id;
                        sinceId = maxId;

                        if (batch.length < 250) {
                            hasMore = false; // Reached the end of the database
                        }
                    }
                }
                // If asking for recent stuff, usually you want descending. since_id yielded ascending natively.
                return allOrders.reverse();
            } catch (err: any) {
                console.error('[ShopifyService] Error fetching orders:', err.message);
                this.cachePromise = null;
                return [];
            }
        })();

        return this.cachePromise;
    }

    public async getRecentOrdersFilter(limit: number = 50, rangeStr: string = 'Today'): Promise<any[]> {
        const liveOrders = await this.getRecentOrders(250); // Shopify physical API max request cap

        // Parse range string limit bounds
        const now = new Date();
        let startTime = now.getTime();
        let endTime = now.getTime();

        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (rangeStr.includes('Yesterday')) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            startTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
            endTime = startTime + 24 * 60 * 60 * 1000 - 1;
        } else if (rangeStr.includes('7 Days')) {
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            startTime = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate()).getTime();
        } else if (rangeStr.includes('30 Days')) {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            startTime = new Date(thirtyDaysAgo.getFullYear(), thirtyDaysAgo.getMonth(), thirtyDaysAgo.getDate()).getTime();
        } else if (rangeStr.includes('3 Months') || rangeStr.includes('Quarter')) {
            const quarterAgo = new Date(now);
            quarterAgo.setMonth(now.getMonth() - 3);
            startTime = new Date(quarterAgo.getFullYear(), quarterAgo.getMonth(), quarterAgo.getDate()).getTime();
        } else if (rangeStr.includes('6 Months')) {
            const halfYearAgo = new Date(now);
            halfYearAgo.setMonth(now.getMonth() - 6);
            startTime = new Date(halfYearAgo.getFullYear(), halfYearAgo.getMonth(), halfYearAgo.getDate()).getTime();
        } else if (rangeStr.includes('All Time')) {
            startTime = 0; // Literally all time
        }

        // Filter out bounds accurately based on range criteria natively
        return liveOrders.filter((o: any) => {
            const orderTime = new Date(o.created_at).getTime();
            return orderTime >= startTime && orderTime <= endTime;
        }).slice(0, limit);
    }

    /**
     * Fetch basic store metrics natively from Shopify API
     * Filters specifically for requested date range
     */
    public async getStoreMetrics(rangeStr: string = 'Today'): Promise<any> {
        const filteredOrders = await this.getRecentOrdersFilter(50000, rangeStr);

        let totalRevenue = 0;

        filteredOrders.forEach((order: any) => {
            totalRevenue += parseFloat(order.total_price);
        });

        return {
            totalRevenue: totalRevenue,
            totalOrders: filteredOrders.length,
            averageOrderValue: filteredOrders.length > 0 ? (totalRevenue / filteredOrders.length) : 0,
            activeOrders: filteredOrders.filter((o: any) => o.fulfillment_status === null).length
        };
    };

    /**
     * Fetch live products (inventory) from Shopify
     */
    public async getProducts(): Promise<any[]> {
        try {
            const response = await this.get('products.json?limit=250');
            return response.products || [];
        } catch (err: any) {
            console.error('[ShopifyService] Error fetching products:', err.message);
            return [];
        }
    }

    /**
     * Fetch live customers from Shopify
     */
    public async getCustomers(): Promise<any[]> {
        try {
            const response = await this.get('customers.json?limit=250');
            return response.customers || [];
        } catch (err: any) {
            console.error('[ShopifyService] Error fetching customers:', err.message);
            return [];
        }
    }
}
