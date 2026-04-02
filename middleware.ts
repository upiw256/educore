/**
 * middleware.ts — Entry point resmi Next.js 15 untuk middleware.
 * Re-export dari proxy.ts agar logika auth tetap terpisah dan mudah dikelola.
 */
export { proxy as middleware, config } from './proxy';
