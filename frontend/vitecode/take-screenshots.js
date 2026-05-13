import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

/**
 * Script para capturar screenshots de TODAS as páginas do EmmiPlay (Público + Dashboard).
 * 
 * Requisitos:
 * 1. npm install -D playwright
 * 2. npx playwright install chromium
 * 
 * Para páginas autenticadas:
 * O script tentará fazer login automaticamente usando as credenciais abaixo.
 */

const BASE_URL = 'http://localhost:8080';
const OUTPUT_DIR = './screenshots';

// Credenciais de Teste (AJUSTE SE NECESSÁRIO)
const TEST_AUTH = {
    email: 'admin@emmiplay.com',
    password: 'password123'
};

const pages = [
    // Públicas
    { name: '01-home', url: '/', auth: false },
    { name: '02-pricing', url: '/pricing', auth: false },
    { name: '03-contact', url: '/contato', auth: false },
    { name: '04-help-public', url: '/ajuda', auth: false },
    { name: '05-auth-page', url: '/auth', auth: false },

    // Dashboard (Requer Login)
    { name: '06-dashboard-main', url: '/dashboard', auth: true },
    { name: '07-dashboard-tvs', url: '/dashboard/tvs', auth: true },
    { name: '08-dashboard-contents', url: '/dashboard/contents', auth: true },
    { name: '09-dashboard-playlists', url: '/dashboard/playlists', auth: true },
    { name: '10-dashboard-powerbi', url: '/dashboard/powerbi', auth: true },
    { name: '11-dashboard-members', url: '/dashboard/members', auth: true },
];

async function takeScreenshots() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    console.log('🚀 Iniciando captura geral de screenshots...');
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
    });

    const page = await context.newPage();

    // 1. Fazer login primeiro para as páginas de dashboard
    console.log('🔑 Realizando login para capturas do dashboard...');
    await page.goto(`${BASE_URL}/auth`);
    try {
        await page.fill('input[type="email"]', TEST_AUTH.email);
        await page.fill('input[type="password"]', TEST_AUTH.password);
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('✅ Login realizado com sucesso.');
    } catch (err) {
        console.warn('⚠️ Falha no login automático. Capturas do dashboard podem mostrar a tela de login ou erro.');
    }

    // 2. Capturar cada página
    for (const pageInfo of pages) {
        const fullUrl = `${BASE_URL}${pageInfo.url}`;
        console.log(`📸 Capturando [${pageInfo.name}] em ${fullUrl}...`);

        try {
            await page.goto(fullUrl, { waitUntil: 'networkidle' });

            // Esperar animações e carregamento de componentes
            await page.waitForTimeout(3000);

            // Se for a home, talvez precise de mais tempo para o Hero
            if (pageInfo.url === '/') await page.waitForTimeout(2000);

            const outputPath = path.join(OUTPUT_DIR, `${pageInfo.name}.png`);
            await page.screenshot({ path: outputPath, fullPage: true });

            console.log(`   ✅ Salvo.`);
        } catch (error) {
            console.error(`   ❌ Erro em ${pageInfo.name}:`, error.message);
        }
    }

    await browser.close();
    console.log('\n✨ Processo concluído! Veja os arquivos na pasta /screenshots');
}

takeScreenshots().catch(err => {
    console.error('💥 Erro fatal:', err);
    process.exit(1);
});
