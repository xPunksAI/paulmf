import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fetch from 'node-fetch';

const accessDashboard = async() => {
    chromium.use(StealthPlugin());
    const browser = await chromium.launch({ headless: false }); // Change to false if you want to see the browser
    const context = await browser.newContext();
    const page = await context.newPage();

    // Step 1: Go to the specified URL
    try {
        console.log('Testing the stealth plugin..')
        await page.goto('https://www.cookie.fun/?chain=8453&type=agent', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('tbody.border-none', { timeout: 60000 });
    } catch (error) {
        console.error("Error waiting for going to the URL:", error);
        await browser.close(); // Ensure the browser closes on error
        return; // Exit the function if the selector is not found
    }

    console.log("accessed the table");

    // Get the table screenshot
    try{
        // get the screenshot
        // Get the bounding box of the table
        const table = await page.$('table'); // Select the table element
        const boundingBox = await table.boundingBox(); // Get the bounding box

        // Take a screenshot of the table section
        await page.screenshot({
            path: 'topTrendingTokens.png',
            clip: {
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height
            }
        });

        // Step 3: Extract the top 5 trending token names & data
        const tokens = await page.$$eval(
            'tbody.border-none tr',  // Selecting rows inside the table body
            rows => rows.slice(0, 5).map(row => {
                const columns = row.querySelectorAll('td');
                return {
                    agent: columns[0]?.innerText.trim() || 'N/A',
                    current: columns[1]?.innerText.trim() || 'N/A',
                    change_24h: columns[2]?.innerText.trim() || 'N/A',
                };
            })
        );
        console.log("=====Top 5 Trending Tokens====", tokens);
        await browser.close();
        return tokens;
    }catch(e){
        console.error("Error waiting for screenshot:", e);
        await browser.close();
        return;    
    }
};

const getUniswapV3Pair = async(token) => {
    const tokenTicker = token?.agent
    console.log();
    const apiUrl = `https://api.dexscreener.com/latest/dex/search?q=${tokenTicker}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
            console.log("No data found for token:", tokenTicker);
            return;
        }

        // Find the Uniswap v3 pair that is paired with WETH
        const uniswapPair = data.pairs.find(pair =>
            pair.dexId === 'uniswap' && // Ensure it's from Uniswap
            pair.labels.includes("v3") && // Ensure it's Uniswap V3
            pair.quoteToken.symbol === "WETH" // Ensure it's paired with WETH
        );

        if (!uniswapPair) {
            console.log(`No Uniswap v3 pair found for ${tokenTicker} paired with WETH.`);
            return;
        }

        const tokenAddress = uniswapPair.baseToken.address;
        const pairPoolAddress = uniswapPair.pairAddress;

        // console.log(`Token Ticker: ${tokenTicker}`);
        // console.log(`Token Contract Address: ${tokenAddress}`);
        // console.log(`Uniswap v3 Pair Pool Address: ${pairPoolAddress}`);

        return { ...token, tokenAddress, pairPoolAddress}
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


// DEBUG=playwright-extra*,puppeteer-extra* node index.js

const main = async() => {
    const tokens = await accessDashboard();
    const tokenContracts = [];
    tokens.forEach(async(token) => {
        const tokenContract = await getUniswapV3Pair(token);
        console.log(tokenContract);
        tokenContracts.push(tokenContract);
        return;
    })
    console.log(tokenContracts);
}

main();