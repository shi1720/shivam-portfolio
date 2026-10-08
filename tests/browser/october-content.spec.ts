import { test, expect } from '@playwright/test';
import catalog from '../../src/catalog.json' with { type: 'json' };
import recent from '../../src/recent-stories.json' with { type: 'json' };
import papers from '../../src/research.json' with { type: 'json' };
import AxeBuilder from '@axe-core/playwright';

test('research has six sourced preprints and survives navigation', async ({page}) => {
 await page.goto('/#research');
 await expect(page.locator('.research-paper')).toHaveCount(papers.length);
 for (const p of papers) await expect(page.locator(`a[href="${p.paper}"]`)).toBeVisible();
 await page.getByText('Paper details & scope').first().click();
 await expect(page.getByRole('heading',{name:papers[0].title})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const axe=await new AxeBuilder({page}).include('.research-room').analyze();
 expect(axe.violations).toEqual([]);
 await page.getByRole('link',{name:'Products & experiments'}).click();
 await expect(page.locator('.work-list>button')).toHaveCount(catalog.length);
 await page.goBack();
 await expect(page.locator('.research-paper')).toHaveCount(6);
});
test('new project links and media load without duplicate Signsprout', async ({page})=>{
 expect(catalog.filter(p=>/signsprout/i.test(p.name))).toHaveLength(1);
 expect(catalog.some(p=>/youcam/i.test(p.name))).toBeFalsy();
 for(const [id,s] of Object.entries(recent)){
  await page.goto('/#project='+id);
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link',{name:'Try the project'})).toHaveAttribute('href',s.demo);
  if('video' in s) await expect(dialog.getByRole('link',{name:'Watch the demo'})).toHaveAttribute('href',s.video);
  for(const img of await dialog.locator('img').all()) { await img.scrollIntoViewIfNeeded(); await expect.poll(()=>img.evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBeTruthy(); }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
});
test('video actions are available for legacy entries without a full story',async({page})=>{
 await page.goto('/#project=LexHack');
 await expect(page.getByRole('dialog').getByRole('link',{name:'Watch the demo'})).toHaveAttribute('href','https://www.youtube.com/watch?v=BaLlSJhui1I');
});
