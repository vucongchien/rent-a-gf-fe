import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const GLOBALS_CSS_PATH = path.join(SRC_DIR, 'app', 'globals.css');
const MANIFEST_OUTPUT_PATH = path.resolve(ROOT_DIR, '..', '.agents', 'skills', 'design-tokens-manifest.md');

// ============================================================================
// PARSER FUNCTIONS
// ============================================================================

export function parseCssTokens(cssContent) {
  const tokens = {
    coreColors: [],
    semanticColors: [],
    typography: [],
    radius: [],
    shadows: [],
    others: [],
    utilities: []
  };

  // Extract @theme block
  const themeMatch = cssContent.match(/@theme\s*\{([\s\S]*?)\}/);
  if (themeMatch) {
    const themeContent = themeMatch[1];
    const lines = themeContent.split('\n');
    let currentComment = '';

    for (let rawLine of lines) {
      const line = rawLine.trim();
      
      if (line.startsWith('/*') && line.endsWith('*/')) {
        currentComment = line.replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '').trim();
        continue;
      }
      
      if (line.startsWith('/*')) {
        currentComment = line.replace(/^\/\*\s*/, '').trim();
        continue;
      }
      
      if (line.endsWith('*/') && !line.includes('/*')) {
        currentComment = (currentComment + ' ' + line.replace(/\s*\*\/$/, '').trim()).trim();
        continue;
      }

      if (line.startsWith('*')) {
        currentComment = (currentComment + ' ' + line.replace(/^\*\s*/, '').trim()).trim();
        continue;
      }

      const varMatch = line.match(/^(--[\w-]+)\s*:\s*([^;]+);?(.*)$/);
      if (varMatch) {
        const name = varMatch[1].trim();
        const value = varMatch[2].trim();
        let comment = currentComment;
        
        const inlineCommentMatch = varMatch[3].match(/\/\*\s*([\s\S]*?)\s*\*\//);
        if (inlineCommentMatch) {
          comment = inlineCommentMatch[1].trim();
        }

        const tokenItem = { name, value, description: comment || '' };

        if (name.startsWith('--color-chizuru-') || name.startsWith('--color-ruka-') || 
            name.startsWith('--color-mami-') || name.startsWith('--color-sumi-') || 
            name.startsWith('--color-neutral-') || name.startsWith('--color-emerald-') ||
            name.startsWith('--color-amber-') || name.startsWith('--color-rose-')) {
          tokens.coreColors.push(tokenItem);
        } else if (name.startsWith('--color-')) {
          tokens.semanticColors.push(tokenItem);
        } else if (name.startsWith('--font-')) {
          tokens.typography.push(tokenItem);
        } else if (name.startsWith('--radius-')) {
          tokens.radius.push(tokenItem);
        } else if (name.startsWith('--shadow-')) {
          tokens.shadows.push(tokenItem);
        } else {
          tokens.others.push(tokenItem);
        }

        currentComment = '';
      }
    }
  }

  // Extract @utility blocks
  const utilityRegex = /@utility\s+([\w-]+)\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = utilityRegex.exec(cssContent)) !== null) {
    const name = match[1].trim();
    const rulesBlock = match[2].trim();
    
    const precedingText = cssContent.substring(0, match.index).trim();
    let description = '';
    const commentMatch = precedingText.match(/\/\*\s*((?:[^*]|\*(?!\/))*)\s*\*\/$/);
    if (commentMatch) {
      description = commentMatch[1].trim().replace(/\r?\n/g, ' ');
    }

    const formattedRules = rulesBlock
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ');

    tokens.utilities.push({
      name,
      rules: formattedRules,
      description
    });
  }

  return tokens;
}

export function scanComponents(srcDir) {
  const components = [];
  const componentsDir = path.join(srcDir, 'shared', 'components');

  if (!fs.existsSync(componentsDir)) {
    return components;
  }

  const types = ['atoms', 'molecules', 'organisms'];

  for (const type of types) {
    const dirPath = path.join(componentsDir, type);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if ((file.endsWith('.tsx') || file.endsWith('.ts')) && !file.includes('.test.')) {
        const filePath = path.join(dirPath, file);
        const relativePath = path.relative(path.resolve(srcDir, '..'), filePath);
        const name = path.basename(file, path.extname(file));
        const content = fs.readFileSync(filePath, 'utf-8');
        
        let description = '';
        const docMatch = content.match(/^\s*\/\*\*([\s\S]*?)\*\//) || content.match(/^\s*\/\*([\s\S]*?)\*\//);
        if (docMatch) {
          description = docMatch[1]
            .split('\n')
            .map(line => line.replace(/^\s*\*\s?/, '').trim())
            .filter(line => line.length > 0)
            .join(' ');
        }

        const componentItem = {
          name,
          type: type.slice(0, -1),
          path: relativePath,
          description: description || `UI Component ${name} (${type.slice(0, -1)})`,
          subExports: []
        };

        if (name === 'Icons') {
          const iconExportRegex = /export\s+const\s+(\w+Icon)\s*:/g;
          let iconMatch;
          while ((iconMatch = iconExportRegex.exec(content)) !== null) {
            componentItem.subExports.push(iconMatch[1]);
          }
        }

        components.push(componentItem);
      }
    }
  }

  return components;
}

// ============================================================================
// MARKDOWN GENERATOR
// ============================================================================

function generateMarkdownManifest(tokens, components) {
  let md = `# DESIGN SYSTEM MANIFEST & CHEAT SHEET\n\n`;
  md += `> [!NOTE]\n`;
  md += `> File này được tự động tạo ra bởi script \`my-app/scripts/search-design.mjs\` để hỗ trợ agent/developer tra cứu.\n`;
  md += `> Tuyệt đối **KHÔNG** sửa đổi thủ công file này. Khi có thay đổi về components hoặc css tokens, chạy lại script để cập nhật.\n\n`;

  md += `## 1. Core Palette (Màu Sắc Cơ Bản)\n\n`;
  md += `| Tên Token | Mã màu | Mô tả |\n`;
  md += `| --- | --- | --- |\n`;
  for (const token of tokens.coreColors) {
    md += `| \`var(${token.name})\` | \`${token.value}\` | ${token.description || '-'} |\n`;
  }
  md += `\n`;

  md += `## 2. Semantic Colors (Màu Sắc Theo Ngữ Nghĩa)\n\n`;
  md += `| Tên Token | Ánh xạ / Giá trị | Mô tả |\n`;
  md += `| --- | --- | --- |\n`;
  for (const token of tokens.semanticColors) {
    md += `| \`var(${token.name})\` | \`${token.value}\` | ${token.description || '-'} |\n`;
  }
  md += `\n`;

  md += `## 3. Spacing, Radius & Effect Tokens\n\n`;
  md += `### Border Radius\n`;
  md += `> [!IMPORTANT]\n`;
  md += `> Áp dụng quy tắc: **Height / 4 = Radius** (Ví dụ: h-8 là 32px => bo góc 8px tương ứng với md).\n\n`;
  md += `| Tên Token | Giá trị | Phù hợp cho |\n`;
  md += `| --- | --- | --- |\n`;
  for (const token of tokens.radius) {
    md += `| \`var(${token.name})\` | \`${token.value}\` | ${token.description || '-'} |\n`;
  }
  md += `\n`;

  md += `### Shadows (Độ đổ bóng)\n\n`;
  md += `| Tên Token | Giá trị | Mô tả |\n`;
  md += `| --- | --- | --- |\n`;
  for (const token of tokens.shadows) {
    md += `| \`var(${token.name})\` | \`${token.value}\` | ${token.description || '-'} |\n`;
  }
  md += `\n`;

  md += `## 4. Custom Utility Classes (Các Class Tiện Ích)\n\n`;
  md += `| Class Name | Định nghĩa CSS | Mô tả |\n`;
  md += `| --- | --- | --- |\n`;
  for (const util of tokens.utilities) {
    md += `| \`.${util.name}\` | \`${util.rules}\` | ${util.description || '-'} |\n`;
  }
  md += `\n`;

  md += `## 5. UI Components List (Danh sách Components)\n\n`;
  
  const atoms = components.filter(c => c.type === 'atom');
  const molecules = components.filter(c => c.type === 'molecule');
  const organisms = components.filter(c => c.type === 'organism');

  md += `### Atoms (Các phần tử nguyên tử cơ bản)\n\n`;
  md += `| Component | File Path | Mô tả / Ghi chú |\n`;
  md += `| --- | --- | --- |\n`;
  for (const c of atoms) {
    if (c.name === 'Icons') {
      md += `| [${c.name}](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | [\`${c.path}\`](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | Chứa tất cả SVG Icons dùng chung. **Cấm viết inline SVG**.<br/>Các icon con: ${c.subExports.map(i => `\`${i}\``).join(', ')} |\n`;
    } else {
      md += `| [${c.name}](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | [\`${c.path}\`](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | ${c.description} |\n`;
    }
  }
  md += `\n`;

  if (molecules.length > 0) {
    md += `### Molecules (Các phân tử trung gian)\n\n`;
    md += `| Component | File Path | Mô tả |\n`;
    md += `| --- | --- | --- |\n`;
    for (const c of molecules) {
      md += `| [${c.name}](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | [\`${c.path}\`](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | ${c.description} |\n`;
    }
    md += `\n`;
  }

  if (organisms.length > 0) {
    md += `### Organisms (Các khối phức hợp lớn)\n\n`;
    md += `| Component | File Path | Mô tả |\n`;
    md += `| --- | --- | --- |\n`;
    for (const c of organisms) {
      md += `| [${c.name}](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | [\`${c.path}\`](file:///${path.resolve(ROOT_DIR, c.path).replace(/\\/g, '/')}) | ${c.description} |\n`;
    }
    md += `\n`;
  }

  return md;
}

// ============================================================================
// SEARCH CLI FUNCTION
// ============================================================================

function runSearch(tokens, components, query) {
  const q = query.toLowerCase();
  console.log(`\n\x1b[36m=== KẾT QUẢ TÌM KIẾM CHO: "${query}" ===\x1b[0m\n`);

  let found = false;

  // 1. Search Components
  const matchedComponents = components.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.description.toLowerCase().includes(q)
  );

  if (matchedComponents.length > 0) {
    found = true;
    console.log(`\x1b[32m✔ COMPONENTS PHÙ HỢP:\x1b[0m`);
    matchedComponents.forEach(c => {
      console.log(`  * \x1b[1m[${c.type.toUpperCase()}] ${c.name}\x1b[0m - ${c.description}`);
      console.log(`    \x1b[90mCách dùng:\x1b[0m import { ${c.name} } from '@/shared/components/${c.type}s/${c.name}'`);
      console.log(`               <${c.name} />`);
    });
    console.log();
  }

  // 2. Search SubIcons
  const iconsComp = components.find(c => c.name === 'Icons');
  if (iconsComp) {
    const matchedIcons = iconsComp.subExports.filter(iconName => 
      iconName.toLowerCase().includes(q)
    );
    if (matchedIcons.length > 0) {
      found = true;
      console.log(`\x1b[32m✔ ICONS TRONG Icons.tsx PHÙ HỢP:\x1b[0m`);
      matchedIcons.forEach(iconName => {
        console.log(`  * \x1b[1m[ICON] ${iconName}\x1b[0m`);
        console.log(`    \x1b[90mCách dùng:\x1b[0m import { ${iconName} } from '@/shared/components/atoms/Icons'`);
        console.log(`               <${iconName} size={20} className="text-brand" />`);
      });
      console.log();
    }
  }

  // 3. Search design tokens
  const allTokens = [
    ...tokens.coreColors.map(t => ({ ...t, cat: 'Core Colors' })),
    ...tokens.semanticColors.map(t => ({ ...t, cat: 'Semantic Colors' })),
    ...tokens.typography.map(t => ({ ...t, cat: 'Typography' })),
    ...tokens.radius.map(t => ({ ...t, cat: 'Border Radius' })),
    ...tokens.shadows.map(t => ({ ...t, cat: 'Shadows' })),
    ...tokens.others.map(t => ({ ...t, cat: 'Other Tokens' }))
  ];

  const matchedTokens = allTokens.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.value.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q)
  );

  if (matchedTokens.length > 0) {
    found = true;
    console.log(`\x1b[32m✔ DESIGN TOKENS PHÙ HỢP:\x1b[0m`);
    matchedTokens.forEach(t => {
      console.log(`  * \x1b[33mvar(${t.name})\x1b[0m = \x1b[1m${t.value}\x1b[0m (${t.cat})`);
      
      let usage = '';
      if (t.name.startsWith('--color-')) {
        const colorName = t.name.replace('--color-', '');
        usage = `bg-${colorName} | text-${colorName} | border-${colorName} | var(${t.name})`;
      } else if (t.name.startsWith('--radius-')) {
        const radiusName = t.name.replace('--radius-', '');
        usage = `rounded-${radiusName} | var(${t.name})`;
      } else if (t.name.startsWith('--shadow-')) {
        const shadowName = t.name.replace('--shadow-', '');
        usage = `shadow-${shadowName} | var(${t.name})`;
      } else {
        usage = `var(${t.name})`;
      }
      console.log(`    \x1b[90mCách dùng:\x1b[0m ${usage}`);
    });
    console.log();
  }

  // 4. Search utilities
  const matchedUtils = tokens.utilities.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.rules.toLowerCase().includes(q) || 
    u.description.toLowerCase().includes(q)
  );

  if (matchedUtils.length > 0) {
    found = true;
    console.log(`\x1b[32m✔ UTILITY CLASSES PHÙ HỢP:\x1b[0m`);
    matchedUtils.forEach(u => {
      console.log(`  * \x1b[35m.${u.name}\x1b[0m { \x1b[2m${u.rules}\x1b[0m }`);
      console.log(`    \x1b[90mCách dùng:\x1b[0m className="${u.name}"`);
    });
    console.log();
  }

  if (!found) {
    console.log(`\x1b[31m❌ Không tìm thấy kết quả nào phù hợp với từ khóa "${query}".\x1b[0m\n`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  if (!fs.existsSync(GLOBALS_CSS_PATH)) {
    console.error(`Không tìm thấy file globals.css tại: ${GLOBALS_CSS_PATH}`);
    process.exit(1);
  }

  const cssContent = fs.readFileSync(GLOBALS_CSS_PATH, 'utf-8');
  const tokens = parseCssTokens(cssContent);
  const components = scanComponents(SRC_DIR);

  const args = process.argv.slice(2);
  const queryIndex = args.findIndex(arg => arg === '--query' || arg === '-q');
  const jsonMode = args.includes('--json');
  const docMode = args.includes('--generate-doc');

  if (jsonMode) {
    console.log(JSON.stringify({ tokens, components }, null, 2));
    return;
  }

  if (queryIndex !== -1 && args[queryIndex + 1]) {
    const query = args[queryIndex + 1];
    runSearch(tokens, components, query);
    return;
  }

  const manifestMd = generateMarkdownManifest(tokens, components);
  const parentDir = path.dirname(MANIFEST_OUTPUT_PATH);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  fs.writeFileSync(MANIFEST_OUTPUT_PATH, manifestMd, 'utf-8');
  console.log(`\x1b[32m✔ Đã tạo/cập nhật thành công Manifest tĩnh tại:\x1b[0m`);
  console.log(`  ${MANIFEST_OUTPUT_PATH}\n`);
  
  if (!docMode) {
    console.log(`Để tìm kiếm component hoặc tokens bằng CLI, chạy:`);
    console.log(`  node scripts/search-design.mjs --query <từ_khóa>`);
    console.log();
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main();
}
