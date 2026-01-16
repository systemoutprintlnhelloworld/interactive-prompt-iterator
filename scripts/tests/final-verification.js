const { chromium } = require('playwright');

(async () => {
  console.log('🧪 最终验证所有修复...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('1️⃣ 访问应用 (端口 3002)...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
    console.log('✅ 应用加载成功\n');

    // 问题1: 测试附件显示
    console.log('2️⃣ 测试问题1: 附件显示逻辑...');
    console.log('   上传PDF文件...');

    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyMDIKJSVFT0Y=', 'base64')
    });
    await page.waitForTimeout(1000);

    // 发送消息
    await page.fill('textarea[placeholder*="描述"]', '测试附件显示');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 检查是否使用了 FileAttachmentIcon
    const hasFileIcon = await page.locator('.inline-flex.items-center.gap-2').count();
    console.log(`   附件图标显示: ${hasFileIcon > 0 ? '✅' : '❌'}`);

    // 检查hover是否显示悬浮窗
    if (hasFileIcon > 0) {
      await page.locator('.inline-flex.items-center.gap-2').first().hover();
      await page.waitForTimeout(500);
      const hasTooltip = await page.locator('[role="tooltip"]').count();
      console.log(`   hover悬浮窗: ${hasTooltip > 0 ? '✅' : '❌'}`);
    }
    console.log('');

    // 问题3: 测试表单宽度
    console.log('3️⃣ 测试问题3: 表单全宽显示...');
    await page.fill('textarea[placeholder*="描述"]', '帮我写一个测试方案');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    // 检查表单宽度
    const formCards = await page.locator('.border-primary\\/20').all();
    if (formCards.length > 0) {
      const box = await formCards[0].boundingBox();
      const viewportSize = page.viewportSize();
      const widthPercent = box ? (box.width / viewportSize.width * 100).toFixed(1) : 0;
      console.log(`   表单宽度: ${box?.width}px (${widthPercent}% 视口)`);
      console.log(`   ${box && box.width > 1200 ? '✅ 全宽显示' : '❌ 仍然较窄'}\n`);
    }

    // 问题2: 测试全屏预览宽度
    console.log('4️⃣ 测试问题2: 全屏预览宽度...');
    const fullscreenBtn = await page.locator('button[title*="全屏"]').first();
    if (await fullscreenBtn.count() > 0) {
      await fullscreenBtn.click();
      await page.waitForTimeout(1000);

      const modal = await page.locator('.fixed.inset-0').first();
      const modalBox = await modal.boundingBox();
      const modalWidthPercent = modalBox ? (modalBox.width / viewportSize.width * 100).toFixed(1) : 0;
      console.log(`   全屏宽度: ${modalBox?.width}px (${modalWidthPercent}% 视口)`);
      console.log(`   ${modalBox && modalBox.width > 1500 ? '✅ 足够宽' : '❌ 仍然较窄'}\n`);

      // 关闭全屏
      await page.keyboard.press('Escape');
    }

    console.log('📝 请手动检查:');
    console.log('   1. 附件是否使用 SVG 图标显示');
    console.log('   2. hover 附件是否显示悬浮窗');
    console.log('   3. 表单是否占据大部分宽度');
    console.log('   4. 全屏预览是否比默认更宽\n');

    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
    console.log('\n🎉 测试完成!');
  }
})();
