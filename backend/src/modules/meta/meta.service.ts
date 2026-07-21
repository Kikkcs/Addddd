export interface MetaAdCampaign {
    id: string;
    name: string;
    spend: number;
    roas: number;
    cpc: number;
    impressions: number;
    clicks: number;
    conversions: number;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

export class MetaAdsService {
    private static instance: MetaAdsService;

    private constructor() { }

    public static getInstance(): MetaAdsService {
        if (!MetaAdsService.instance) {
            MetaAdsService.instance = new MetaAdsService();
        }
        return MetaAdsService.instance;
    }

    public async getCampaignInsights(): Promise<MetaAdCampaign[]> {
        const accessToken = process.env.META_ACCESS_TOKEN;
        const adAccountId = process.env.META_AD_ACCOUNT_ID;

        if (accessToken && adAccountId) {
            // In a real implementation:
            // fetch(`https://graph.facebook.com/v19.0/act_${adAccountId}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,actions...&access_token=${accessToken}`)
            // For now, return mock data if integration fails or is fake
        }

        // Mock Response mapped to Adeaur's business logic
        return [
            {
                id: 'c_1001',
                name: 'Summer Oud - Broad Audience',
                spend: 450.50,
                roas: 3.2,
                cpc: 0.12,
                impressions: 45000,
                clicks: 3754,
                conversions: 89,
                status: 'ACTIVE'
            },
            {
                id: 'c_1002',
                name: 'Add-to-Cart Retargeting (7D)',
                spend: 120.00,
                roas: 6.8,
                cpc: 0.08,
                impressions: 12000,
                clicks: 1500,
                conversions: 45,
                status: 'ACTIVE'
            },
            {
                id: 'c_1003',
                name: 'Floral Collection Launch',
                spend: 300.00,
                roas: 1.5,
                cpc: 0.45,
                impressions: 21000,
                clicks: 666,
                conversions: 12,
                status: 'PAUSED'
            }
        ];
    }
}
