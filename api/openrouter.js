export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get the API key from the environment variables (NOT exposed to frontend)
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: { message: 'Server configuration error: OPENROUTER_API_KEY is missing.' } });
    }

    try {
        // Forward the request to OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': req.headers.origin || 'https://crealix-ai.vercel.app', 
                'X-Title': 'Crealix AI'
            },
            // Pass the body exactly as received from the frontend
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Return the OpenRouter response to the frontend
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: { message: error.message || 'Internal Server Error' } });
    }
}
