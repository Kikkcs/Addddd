import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ShopifyService } from '../shopify/shopify.service.js';
import Groq from 'groq-sdk';

export async function aiRoutes(fastify: FastifyInstance) {
    const shopify = ShopifyService.getInstance();

    const groqApiKey = process.env.GROQ_API_KEY || '';
    let groq: Groq | null = null;

    if (groqApiKey) {
        groq = new Groq({ apiKey: groqApiKey });
        console.log('[Omni AI] Groq LLM engine initialized (Llama 3).');
    } else {
        console.warn('[Omni AI] No GROQ_API_KEY found. AI will use basic fallback.');
    }

    /**
     * POST /api/v1/ai/ask
     * Receives a natural language question. Pulls live store data as context,
     * then sends it to Groq's Llama 3 model for an intelligent response.
     */
    fastify.post('/api/v1/ai/ask', async (req: FastifyRequest<{ Body: { question: string; dateRange?: string } }>, reply: FastifyReply) => {
        try {
            const { question, dateRange } = req.body as any;
            if (!question) return reply.status(400).send({ success: false, error: 'Missing question' });

            const rangeStr = dateRange || 'Last 30 Days';

            // 1. Pull live data context from all three integrations
            const [metrics, orders, products] = await Promise.all([
                shopify.getStoreMetrics(rangeStr),
                shopify.getRecentOrdersFilter(250, rangeStr),
                shopify.getProducts()
            ]);

            // 2. Compute derived insights
            const fulfilledCount = orders.filter((o: any) => o.fulfillment_status === 'fulfilled').length;
            const unfulfilledCount = orders.filter((o: any) => !o.fulfillment_status).length;
            const codOrders = orders.filter((o: any) => {
                const gw = (o.gateway || '').toLowerCase();
                return gw.includes('cash') || gw.includes('cod');
            }).length;
            const prepaidOrders = orders.length - codOrders;

            const lowStockProducts = products.filter((p: any) => {
                const v = p.variants?.[0];
                return v && v.inventory_quantity <= 10;
            }).map((p: any) => `${p.title} (SKU: ${p.variants[0].sku || 'N/A'}, Stock: ${p.variants[0].inventory_quantity})`);

            const topCities = orders.reduce((acc: Record<string, number>, o: any) => {
                const city = o.shipping_address?.city || 'Unknown';
                acc[city] = (acc[city] || 0) + 1;
                return acc;
            }, {});
            const topCitiesList = Object.entries(topCities)
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 5)
                .map(([city, count]) => `${city}: ${count} orders`)
                .join(', ');

            // 3. Build the system prompt with live data injected
            const systemPrompt = `You are "Adeaur AI", an elite e-commerce business intelligence assistant for Adeaur, a premium Indian perfume & beauty brand running on Shopify.

You have access to LIVE, REAL-TIME data from three integrated systems:
- **Shopify** (orders, products, revenue)
- **Delhivery** (logistics, shipping, tracking)  
- **GoKwik** (checkout optimization, RTO risk prevention)

Here is the current LIVE business state for the period "${rangeStr}":

📊 KEY METRICS:
- Total Revenue: ₹${metrics.totalRevenue.toLocaleString('en-IN')}
- Total Orders: ${metrics.totalOrders}
- Average Order Value (AOV): ₹${metrics.averageOrderValue.toFixed(0)}
- Active (Unfulfilled) Orders: ${metrics.activeOrders}
- Fulfilled Orders: ${fulfilledCount}
- Awaiting Dispatch: ${unfulfilledCount}

💳 PAYMENT BREAKDOWN:
- Prepaid Orders: ${prepaidOrders} (${orders.length > 0 ? ((prepaidOrders / orders.length) * 100).toFixed(1) : 0}%)
- COD Orders: ${codOrders} (${orders.length > 0 ? ((codOrders / orders.length) * 100).toFixed(1) : 0}%)

📦 INVENTORY ALERTS:
- Low Stock Items (≤10 units): ${lowStockProducts.length > 0 ? lowStockProducts.join('; ') : 'None — all products healthy'}
- Total Active Products: ${products.length}

🚚 LOGISTICS:
- Top Shipping Destinations: ${topCitiesList || 'No data yet'}

RULES:
1. Always reference REAL numbers from the data above. Never make up figures.
2. Keep responses concise but insightful (3-5 sentences max).
3. Use bold (**text**) for key metrics and product names.
4. Suggest 2-3 actionable next steps when relevant.
5. If asked about something not in the data, say so honestly.
6. Use ₹ for currency. Format Indian numbers with commas (e.g., ₹1,50,000).
7. Be professional but conversational — think McKinsey consultant meets friendly advisor.`;

            // 4. If Groq is available, use it. Otherwise, fall back.
            if (groq) {
                const chatCompletion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: question }
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 600,
                });

                const aiAnswer = chatCompletion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';

                // Generate contextual follow-up suggestions
                const followUpCompletion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: 'You are an e-commerce AI. Given the user question and your answer, suggest exactly 3 short follow-up questions the user might want to ask next. Return ONLY a JSON array of 3 strings, nothing else. Example: ["Question 1?", "Question 2?", "Question 3?"]' },
                        { role: 'user', content: `User asked: "${question}"\nYour answer was: "${aiAnswer.substring(0, 300)}"` }
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.5,
                    max_tokens: 150,
                });

                let suggestedQuestions = ['Show me revenue breakdown', 'Which products need restocking?', 'How is shipping performance?'];
                try {
                    const parsed = JSON.parse(followUpCompletion.choices[0]?.message?.content || '[]');
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        suggestedQuestions = parsed.slice(0, 3);
                    }
                } catch (e) {
                    // Keep defaults
                }

                return reply.status(200).send({
                    success: true,
                    data: { answer: aiAnswer, suggestedQuestions }
                });
            }

            // Fallback: basic keyword matching if Groq is not available
            return reply.status(200).send({
                success: true,
                data: {
                    answer: `📊 **Live Store Summary (${rangeStr}):** Revenue: ₹${metrics.totalRevenue.toLocaleString('en-IN')}, Orders: ${metrics.totalOrders}, AOV: ₹${metrics.averageOrderValue.toFixed(0)}. ${lowStockProducts.length > 0 ? `⚠️ ${lowStockProducts.length} products are low on stock.` : '✅ All inventory levels healthy.'}`,
                    suggestedQuestions: ['Show me revenue breakdown', 'Which products need restocking?', 'How is shipping performance?']
                }
            });

        } catch (err: any) {
            fastify.log.error(`[AI Route Error] ${err.message}`);
            return reply.status(500).send({ success: false, error: 'AI processing failed' });
        }
    });
}
