// Test di mappatura per vedere tutti gli elementi della pagina
import { test, expect } from '@playwright/test';

test('Mappatura pagina homepage', async ({ page }) => {
  console.log('🌐 Navigando alla homepage...');
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  
  // Fai uno screenshot per vedere la pagina
  await page.screenshot({ path: 'homepage-mapping.png' });
  
  // Mappa tutti gli elementi della pagina
  const pageInfo = await page.evaluate(() => {
    const info = {
      title: document.title,
      url: window.location.href,
      buttons: [],
      links: [],
      inputs: [],
      forms: [],
      text: []
    };
    
    // Mappa tutti i pulsanti
    document.querySelectorAll('button').forEach(btn => {
      info.buttons.push({
        text: btn.textContent?.trim() || '',
        id: btn.id || '',
        className: btn.className || '',
        visible: btn.offsetParent !== null
      });
    });
    
    // Mappa tutti i link
    document.querySelectorAll('a').forEach(link => {
      info.links.push({
        text: link.textContent?.trim() || '',
        href: link.href || '',
        id: link.id || '',
        visible: link.offsetParent !== null
      });
    });
    
    // Mappa tutti gli input
    document.querySelectorAll('input').forEach(input => {
      info.inputs.push({
        type: input.type || '',
        placeholder: input.placeholder || '',
        id: input.id || '',
        name: input.name || '',
        visible: input.offsetParent !== null
      });
    });
    
    // Mappa tutti i form
    document.querySelectorAll('form').forEach(form => {
      info.forms.push({
        id: form.id || '',
        action: form.action || '',
        method: form.method || '',
        className: form.className || ''
      });
    });
    
    // Mappa tutto il testo visibile
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
    textElements.forEach(el => {
      const text = el.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) {
        info.text.push({
          tag: el.tagName,
          text: text,
          id: el.id || '',
          className: el.className || ''
        });
      }
    });
    
    return info;
  });
  
  console.log('📄 INFORMAZIONI PAGINA:');
  console.log('Titolo:', pageInfo.title);
  console.log('URL:', pageInfo.url);
  
  console.log('\n🔘 PULSANTI TROVATI:');
  pageInfo.buttons.forEach(btn => {
    if (btn.visible && btn.text) {
      console.log(`- "${btn.text}" (id: ${btn.id}, class: ${btn.className})`);
    }
  });
  
  console.log('\n🔗 LINK TROVATI:');
  pageInfo.links.forEach(link => {
    if (link.visible && link.text) {
      console.log(`- "${link.text}" (href: ${link.href})`);
    }
  });
  
  console.log('\n📝 INPUT TROVATI:');
  pageInfo.inputs.forEach(input => {
    if (input.visible) {
      console.log(`- type: ${input.type}, placeholder: "${input.placeholder}", id: ${input.id}, name: ${input.name}`);
    }
  });
  
  console.log('\n📋 FORM TROVATI:');
  pageInfo.forms.forEach(form => {
    console.log(`- id: ${form.id}, action: ${form.action}, method: ${form.method}`);
  });
  
  console.log('\n📝 TESTO PRINCIPALE:');
  pageInfo.text.slice(0, 20).forEach(text => {
    console.log(`- ${text.tag}: "${text.text}"`);
  });
  
  // Salva le informazioni in un file per riferimento
  await page.evaluate((info) => {
    const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-mapping.json';
    a.click();
    URL.revokeObjectURL(url);
  }, pageInfo);
  
  console.log('\n✅ Mappatura completata! Screenshot salvato come homepage-mapping.png');
});
