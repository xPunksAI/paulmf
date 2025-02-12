// sample doc: https://docs.gaianet.ai/agent-integrations/intro
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// my custom node: https://0x970843fcc68194f4645588c6b47fae40e8ac441f.us.gaianet.network/v1
const gaiaNodeURL = 'https://0x970843fcc68194f4645588c6b47fae40e8ac441f.us.gaianet.network/v1';

const client = new OpenAI({
    baseURL: gaiaNodeURL,
    apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
  });
  
  async function main() {
    // TODO: fix 404 error
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: 'user', content: 'Say this is a test' }],
      model: 'llama-3-8b-instruct',
    });
    chatCompletion();
  }
  
main();