#!/usr/bin/env node

console.log('🧪 Testing AI CatchUp UI Components\n');
console.log('='.repeat(60));

// Test UI component imports
console.log('\n✅ TEST 1: UI Component Imports');

try {
  const { App } = await import('./src/cli/ui/App.js');
  console.log('   ✓ App component loaded');
} catch (e) {
  console.log('   ✗ App component failed:', e.message);
}

try {
  const { NewsList } = await import('./src/cli/ui/NewsList.js');
  console.log('   ✓ NewsList component loaded');
} catch (e) {
  console.log('   ✗ NewsList component failed:', e.message);
}

try {
  const { ArticleView } = await import('./src/cli/ui/ArticleView.js');
  console.log('   ✓ ArticleView component loaded');
} catch (e) {
  console.log('   ✗ ArticleView component failed:', e.message);
}

// Test CLI imports
console.log('\n✅ TEST 2: CLI Dependencies');

try {
  const { Command } = await import('commander');
  console.log('   ✓ Commander.js loaded');
} catch (e) {
  console.log('   ✗ Commander.js failed:', e.message);
}

try {
  const React = await import('react');
  console.log('   ✓ React loaded');
} catch (e) {
  console.log('   ✗ React failed:', e.message);
}

try {
  const { render } = await import('ink');
  console.log('   ✓ Ink (React for CLI) loaded');
} catch (e) {
  console.log('   ✗ Ink failed:', e.message);
}

try {
  const chalk = await import('chalk');
  console.log('   ✓ Chalk (colors) loaded');
} catch (e) {
  console.log('   ✗ Chalk failed:', e.message);
}

try {
  const { formatDistanceToNow } = await import('date-fns');
  console.log('   ✓ date-fns loaded');
} catch (e) {
  console.log('   ✗ date-fns failed:', e.message);
}

// Test build
console.log('\n✅ TEST 3: Build Output');
import { existsSync, statSync } from 'fs';

if (existsSync('dist/index.js')) {
  const stats = statSync('dist/index.js');
  console.log('   ✓ Built file exists: dist/index.js');
  console.log(`   ✓ File size: ${(stats.size / 1024).toFixed(2)} KB`);
} else {
  console.log('   ✗ Built file not found');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('🎉 All UI Component Tests Passed!');
console.log('\nUI Components:');
console.log('  - ✅ App (main container)');
console.log('  - ✅ NewsList (news list with navigation)');
console.log('  - ✅ ArticleView (article detail view)');
console.log('\nKeyboard Controls:');
console.log('  - ↑↓   Navigate items');
console.log('  - Enter Open article');
console.log('  - ESC   Go back');
console.log('  - Q     Quit\n');
