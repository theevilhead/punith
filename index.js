// You can also use puppeteer core, know more about it here https://developers.google.com/web/tools/puppeteer/get-started#puppeteer-core
const puppeteer = require("puppeteer");

// In prod: Connect to browserless so we don't run Chrome on the same hardware
// In dev: Run the browser locally while in development
const getBrowser = () =>
  puppeteer.launch({ headless: false }); // { headless: false } helps visualize and debug the process easily.

// These are class names of some of the specific elements in these cards
const SELECTORS = {
  NAME: ".qBF1Pd.fontHeadlineSmall",
  LISTING: 'a[href^="https://www.google.com/maps/place/',
  RATINGS: ".ZkP5Je",
  PRICE: ".wcldff.fontHeadlineSmall.Cbys4b",
  LINK: ".hfpxzc",
  IMAGE: ".FQ2IWe.p0Hhde",
  NAV_BUTTONS: ".TQbB2b",
  PHONE: ".UsdlK",
  EXTRA: ".W4Efsd",
  WEBSITE: ".CsEnBe",
};

// Scrapes the data from the page
const getData = async (page) => {
  return await page.evaluate(
    (opts) => {
      const { selectors: SELECTORS } = opts;

      const elements = document.querySelectorAll(
        SELECTORS.LISTING
      );

      const placesElements = Array.from(elements).map(
        (element) => element.parentElement
      );

      // Click on the LISTING

      const places = placesElements.map(
        async (place, index) => {
          console.log(place);

          // const listingLink = place.querySelector("a");
          // if (listingLink) {
          //   // Simulate click on the listing link
          //   listingLink.click();

          //   // Wait till view appears
          //   await new Promise((resolve) =>
          //     setTimeout(resolve, 5000)
          //   );
          //   console.log(
          //     document
          //       .querySelector(".bJzME.Hu9e2e.tTVLSc")
          //       .querySelectorAll(".CsEnBe")[1]
          //       ?.getAttribute("href") || "NA"
          //   );
          // }

          // Getting the names
          const name = (
            place.querySelector(SELECTORS.NAME)
              ?.textContent || ""
          ).trim();
          const rating = (
            place.querySelector(SELECTORS.RATINGS)
              ?.textContent || ""
          ).trim();
          const price = (
            place.querySelector(SELECTORS.PRICE)
              ?.textContent || ""
          ).trim();
          const link =
            place.querySelector(SELECTORS.LINK)?.href || "";
          const image =
            place.querySelector(SELECTORS.IMAGE)
              ?.children[0].src || "";
          const phone =
            place.querySelector(SELECTORS.PHONE)
              ?.textContent || "NA";
          const extra =
            place.querySelectorAll(SELECTORS.EXTRA)[1]
              ?.textContent || "NA";
          // const website =
          //   document
          //     .querySelector(".bJzME.Hu9e2e.tTVLSc")
          //     .querySelectorAll(".CsEnBe")[1]
          //     ?.getAttribute("href") || "NA";

          return {
            name,
            rating,
            price,
            link,
            image,
            phone,
            extra,
            // website,
          };
        }
      );

      const allPlaces = Promise.all(places);
      return allPlaces;
    },
    { selectors: SELECTORS, page }
  );
};

(async () => {
  let browser = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    // Connect to remote endpoint
    // Reset the viewport for more results in single page of google maps.
    await page.setViewport({ width: 1440, height: 789 });

    // Visit maps.google.com
    await page.goto("https://maps.google.com");

    // Wait till the page loads and an input field with id searchboxinput is present
    await page.waitForSelector("#searchboxinput");
    // Simulate user click
    await page.click("#searchboxinput");

    // Type our search query
    await page.type(
      "#searchboxinput",
      "riding gears store in United Arab Emirates"
    );
    // Simulate pressing Enter key
    await page.keyboard.press("Enter");

    await page.evaluate(async (timeout) => {
      await new Promise((resolve) =>
        setTimeout(resolve, timeout)
      );
    }, 10000);

    // Wait for the page to load results.
    await page.waitForSelector(SELECTORS.LISTING);

    // Get our final structured data
    const finalData = await getData(page);

    console.log("Final data", finalData);

    // browser.close();
    return finalData;
  } catch (error) {
    console.log(error);
  }
})();
