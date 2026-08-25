import { db } from '../server/db.js';
import { validateProductImages } from '../server/utils/imageValidator.js';

console.log('Running Zylo Commerce Product Catalog & Image Audit...\n');
const report = validateProductImages(db.products);

console.log('--- JSON AUDIT SUMMARY ---');
console.log(JSON.stringify(report, null, 2));

if (!report.isValid) {
  console.error('Audit failed: Issues detected in product catalog.');
  process.exit(1);
} else {
  console.log('Audit passed: All products have valid, matching, unique primary images.');
  process.exit(0);
}
