import { Request, Response } from "express";
import { chromium } from "playwright-chromium";

import Laptop from "../models/Laptop";

export async function getLenovoLaptops(req: Request, res: Response) {
  const baseUrl: string = "https://webscraper.io";

  try {
    // Connects to the website
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(
      "https://webscraper.io/test-sites/e-commerce/allinone/computers/laptops"
    );

    // Get Lenovo laptops details page URLs
    let laptopDetails: Array<string> = [];
    for (const h4 of await page.locator(".title").all()) {
      const laptopTitle = await h4.innerText();
      if (!laptopTitle.includes("Lenovo")) continue;

      const path = await h4.getAttribute("href");
      laptopDetails.push(baseUrl + path);
    }
    if (laptopDetails.length < 1)
      return res.status(200).json({ message: "No Lenovo laptop was found." });

    // Goes into each URL, gets the info and add the created laptop to the array
    let laptops: Array<Laptop> = [];
    for (let url of laptopDetails) {
      await page.goto(url);

      let memoryInStock: Array<string> = [];
      for (const memory of await page.locator(".swatch").all()) {
        const classes = await memory.getAttribute("class");

        const option = classes as string;
        if (option.includes("disabled")) continue;

        memoryInStock.push(await memory.innerText());
      }

      const reviewsText = (await page
        .locator(".ratings")
        .innerText()) as string;
      const reviews = parseInt(reviewsText.replace("reviews", "").trim());
      const image =
        baseUrl + (await page.locator(".img-responsive").getAttribute("src"));
      const title = await page.locator(".caption>h4>>nth=1").innerText();
      const price = await page.locator(".caption>h4>>nth=0").innerText();
      const description = await page.locator(".description").innerText();
      const rating = await page.locator(".glyphicon").count();

      const laptop: Laptop = {
        image: image,
        title: title,
        price: parseFloat(price.substring(1)),
        description: description,
        memoryInStock: memoryInStock,
        reviews: reviews,
        rating: rating,
      };
      laptops.push(laptop);
    }

    // Sorts by cheapest
    laptops.sort((a, b) => {
      return a.price - b.price;
    });

    await browser.close();

    return res.status(200).json(laptops);
  } catch (e: any) {
    return res.status(500).json({
      message: "An unexpected error occurred.",
      e,
    });
  }
}
