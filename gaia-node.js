// sample doc: https://docs.gaianet.ai/agent-integrations/intro
import OpenAI from 'openai';
const gaiaNodeURL = 'https://YOUR-NODE-ID.us.gaianet.network/v1';

const client = new OpenAI({
    baseURL: gaiaNodeURL,
    apiKey: process.env['GAIA_API_KEY'], // This is the default and can be omitted
  });
  
  async function main() {
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Say this is a test' }],
      model: 'gpt-4o',
    });
  }
  
main();