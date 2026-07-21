import * as https from 'https';

export class DelhiveryService {
    private static instance: DelhiveryService;
    private readonly apiToken: string;

    private constructor() {
        this.apiToken = process.env.DELHIVERY_API_TOKEN || '';
    }

    public static getInstance(): DelhiveryService {
        if (!DelhiveryService.instance) {
            DelhiveryService.instance = new DelhiveryService();
        }
        return DelhiveryService.instance;
    }

    /**
     * Track multiple AWBs via Delhivery API
     */
    public async trackShipments(awbs: string[]): Promise<any> {
        if (!this.apiToken || this.apiToken.includes('PASTE_')) {
            console.warn('[Delhivery] Missing API token. Returning mock tracking data.');
            // Fallback mock data for demo purposes until token is pasted
            return awbs.map(awb => ({
                awb,
                status: 'In Transit',
                delayDays: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
                location: 'Delhivery Hub, NCR'
            }));
        }

        const waybills = awbs.join(',');

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'track.delhivery.com',
                path: `/api/v1/packages/json/?waybill=${waybills}&token=${this.apiToken}`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);

                        const shipmentData = parsed.ShipmentData || [];

                        // Delhivery returns an array of shipments, match them with requested AWBs
                        const mappedData = awbs.map(awb => {
                            const match = shipmentData.find((s: any) => s.Shipment && s.Shipment.AWB === awb);
                            if (match && match.Shipment) {
                                return {
                                    awb,
                                    status: match.Shipment.Status?.Status || 'In Transit',
                                    delayDays: 0,
                                    location: match.Shipment.Status?.StatusLocation || 'Unknown'
                                };
                            }

                            // Fallback for AWBs it cannot find (e.g. mock AWBs)
                            return {
                                awb,
                                status: 'In Transit',
                                delayDays: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
                                location: 'Delhivery Hub, NCR'
                            };
                        });

                        resolve(mappedData);
                    } catch (e) {
                        reject(new Error(`Delhivery parse error: ${e}`));
                    }
                });
            });

            req.on('error', (err) => reject(err));
            req.end();
        });
    }
}
