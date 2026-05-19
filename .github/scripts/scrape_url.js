const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('https://antigravity.google/download#antigravity-ide', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    const selector = '.platform-column';
    await page.waitForSelector(selector, { timeout: 10000 });

    const downloadUrl = await page.evaluate(() => {
      const columns = Array.from(document.querySelectorAll('.platform-column'));
      const linuxColumn = columns.find(c => {
        const title = c.querySelector('.platform-title')?.innerText.trim();
        return title && title.toLowerCase() === 'linux';
      });
      if (!linuxColumn) return null;

      let links = Array.from(linuxColumn.querySelectorAll('a.download-link'));
      if (links.length === 0) {
        links = Array.from(linuxColumn.querySelectorAll('a'));
      }
      const x64Link = links.find(a => a.innerText.toLowerCase().includes('x64')) || links[0];
      return x64Link ? x64Link.href : null;
    });

    if (downloadUrl) {
      console.log(downloadUrl);
    } else {
      console.error('Download URL not found.');
      process.exit(1);
    }

    await browser.close();
  } catch (error) {
    console.error('Error scraping URL:', error);
    process.exit(1);
  }
})();
