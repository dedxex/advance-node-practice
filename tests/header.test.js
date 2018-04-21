const puppeteer = require('puppeteer');
jest.setTimeout(10000);
let browser,page;
beforeEach( async () => {
    browser = await puppeteer.launch({
        headless : true,
        args : ['--no-sandbox']
    });
    page = await browser.newPage();
    await page.goto("http://localhost:3000")
})

afterEach ( async () => {
    await browser.close();
})

test("we can see blogster logo", async () => {
    const text = await page.$eval("a.brand-logo", el => el.innerHTML);
    expect(text).toEqual("Blogster")
})