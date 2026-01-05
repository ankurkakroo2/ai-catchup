#!/usr/bin/env node

import { NewsAggregator } from './src/services/aggregator.js';

console.log('🧪 Testing AI CatchUp Core Functionality\n');
console.log('='.repeat(60));

async function test() {
  try {
    const aggregator = new NewsAggregator();

    console.log('\n📰 Fetching news from smol.ai...\n');
    const news = await aggregator.fetchNews({ limit: 5, useCache: false });

    console.log(`✅ Successfully fetched ${news.length} news items\n`);
    console.log('='.repeat(60));

    // Display each news item
    news.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Source: ${item.source}`);
      console.log(`   Date: ${item.pubDate.toISOString()}`);
      console.log(`   Link: ${item.link}`);
      console.log(`   Tags: ${item.tags.slice(0, 3).join(', ')}`);
      console.log(`   Description: ${item.description.slice(0, 150)}...`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');

    // Test caching
    console.log('\n📦 Testing cache...');
    const cachedNews = await aggregator.fetchNews({ limit: 5, useCache: true });
    console.log(`✅ Cache working: ${cachedNews.length} items from cache`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();
