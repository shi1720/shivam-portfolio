import {test, expect} from '@playwright/test';
import catalog from '../../src/catalog.json' with {type:'json'};
import media from '../../src/project-media.json' with {type:'json'};

test('every project modal contains a loaded visual and verified legacy app links', async ({page}) => {
 test.setTimeout(90000);
 for (const project of catalog) {
  await page.goto('/#project='+project.id);
  const dialog=page.getByRole('dialog');
  await expect(dialog.locator('.project-visual')).toBeVisible();
  for (const img of await dialog.locator('.project-visual img').all()) {
   await expect.poll(()=>img.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBeTruthy();
  }
  const asset=media[project.id as keyof typeof media];
  if(asset && 'demo' in asset) await expect(dialog.getByRole('link',{name:'Try the project'})).toHaveAttribute('href',asset.demo);
  expect(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBeTruthy();
 }
});

test('research cards stay compact and only the selected card expands',async({page})=>{
 await page.goto('/#research');
 const cards=page.locator('.research-paper');
 await expect(cards).toHaveCount(6);
 const before=await cards.first().boundingBox();
 const targetBefore=await cards.nth(1).boundingBox();
 expect(before!.height).toBeLessThan(490);
 await cards.nth(1).locator('summary').click();
 const after=await cards.first().boundingBox();
 expect(after!.height).toBe(before!.height);
 expect((await cards.nth(1).boundingBox())!.height).toBeGreaterThan(targetBefore!.height+80);
 await expect(page.getByText('arXiv preprints, not peer-reviewed publications.')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});

test('PaperBridge uses the same preview frame as OfferLoop',async({page},testInfo)=>{
 test.skip(testInfo.project.name==='mobile','Work preview is hidden on narrow screens');
 await page.goto('/#work');
 await page.locator('.work-list>button').filter({hasText:'OfferLoop'}).hover();
 const offer=await page.locator('.work-preview .project-visual').boundingBox();
 await page.locator('.work-list>button').filter({hasText:'PaperBridge'}).hover();
 await expect(page.locator('.work-preview .research-visual')).toBeVisible();
 const paper=await page.locator('.work-preview .project-visual').boundingBox();
 expect(paper!.width).toBeCloseTo(offer!.width,0);
 expect(paper!.height).toBeCloseTo(offer!.height,0);
 const image=page.locator('.research-visual img');
 await expect.poll(()=>image.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBeTruthy();
});
