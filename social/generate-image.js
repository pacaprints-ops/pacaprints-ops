// Generates a PNG from a mockup.html file using the system Edge browser.
// Usage: node social/generate-image.js social/content/some-topic/mockup.html
// Output: visual.png saved alongside the HTML file.

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function generateImage(htmlFilePath) {
  const absolutePath = path.resolve(htmlFilePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const outputPath = path.join(path.dirname(absolutePath), 'visual.png');
  const fileUrl = 'file:///' + absolutePath.replace(/\\/g, '/');

  console.log('Opening Edge browser...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 1 });
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Remove scale transform so we capture at full native resolution
    await page.evaluate(() => {
      const post = document.getElementById('post');
      if (post) {
        post.style.transform = 'none';
        post.style.transformOrigin = 'top left';
      }
      // Hide the browser-preview label if present
      document.querySelectorAll('.preview-label').forEach(el => el.remove());
    });

    const postElement = await page.$('#post');
    if (!postElement) {
      throw new Error(
        'Could not find #post element in the HTML file.\n' +
        'Make sure the main canvas div has id="post".'
      );
    }

    await postElement.screenshot({ path: outputPath, type: 'png' });
    console.log(`✓ Saved: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

const htmlFile = process.argv[2];
if (!htmlFile) {
  console.error('Usage: node social/generate-image.js <path-to-mockup.html>');
  process.exit(1);
}

generateImage(htmlFile).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
