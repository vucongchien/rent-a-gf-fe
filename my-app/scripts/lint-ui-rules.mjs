import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Danh sách các file được phép dùng <button>
const ALLOWED_BUTTON_FILES = [
  'Button.tsx',
  'CloseButton.tsx',
  'LikeButton.tsx',
  'VoiceButton.tsx',
  'FilterChip.tsx'
];

// Danh sách các file được phép dùng <svg>
const ALLOWED_SVG_FILES = [
  'Icons.tsx'
];

let hasErrors = false;

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      // Loại trừ thư mục mock, node_modules, build, test, design-system
      if (
        file !== 'mocks' &&
        file !== 'node_modules' &&
        file !== '.next' &&
        file !== 'test' &&
        file !== 'design-system'
      ) {
        results = results.concat(getFilesRecursively(filePath));
      }
    } else {
      // Chỉ kiểm tra file .ts và .tsx, loại trừ các file test
      if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

function checkFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let inCommentBlock = false;
  const errors = [];

  const isButtonAllowed = ALLOWED_BUTTON_FILES.includes(fileName);
  const isSvgAllowed = ALLOWED_SVG_FILES.includes(fileName);

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    let line = rawLine.trim();

    // Xử lý comment block
    if (line.includes('/*')) {
      inCommentBlock = true;
    }
    if (inCommentBlock) {
      if (line.includes('*/')) {
        inCommentBlock = false;
      }
      return; // Bỏ qua dòng trong comment block
    }

    // Bỏ qua comment đơn
    if (line.startsWith('//') || line.startsWith('*')) {
      return;
    }

    // Xóa comment inline cuối dòng (ví dụ: `const x = 1; // comment`)
    if (line.includes('//')) {
      line = line.split('//')[0].trim();
    }

    // 1. Kiểm tra <svg>
    if (!isSvgAllowed && (line.includes('<svg') || line.match(/<svg\b/))) {
      errors.push({
        lineNum,
        content: rawLine.trim(),
        type: 'SVG',
        message: `Cấm sử dụng thẻ <svg> inline. Hãy đưa SVG vào Atoms Icons.tsx.`
      });
    }

    // 2. Kiểm tra <button>
    if (!isButtonAllowed && (line.includes('<button') || line.match(/<button\b/))) {
      errors.push({
        lineNum,
        content: rawLine.trim(),
        type: 'BUTTON',
        message: `Cấm sử dụng thẻ <button> gốc. Hãy sử dụng Button atom (hoặc CloseButton, LikeButton...).`
      });
    }

    // 3. Kiểm tra font chữ lung tung
    const invalidFontRegex = /(?<!-)\bfont-(?!sans\b|display\b|mono\b|inherit\b|thin\b|extralight\b|light\b|normal\b|medium\b|semibold\b|bold\b|extrabold\b|black\b|italic\b|not-italic\b|\[var\(--font-)[a-zA-Z0-9_\-\[\]]+/g;
    let fontMatch;
    while ((fontMatch = invalidFontRegex.exec(line)) !== null) {
      errors.push({
        lineNum,
        content: rawLine.trim(),
        type: 'FONT',
        message: `Cấm sử dụng class font không chuẩn (${fontMatch[0]}). Chỉ được phép dùng font-sans, font-display, font-mono hoặc các class weight/style của Tailwind.`
      });
    }

    if (line.includes('fontFamily') || line.includes('font-family:')) {
      errors.push({
        lineNum,
        content: rawLine.trim(),
        type: 'FONT_INLINE',
        message: `Cấm sử dụng thuộc tính inline fontFamily hoặc font-family. Hãy sử dụng các class font-sans, font-display hoặc font-mono.`
      });
    }


    // 3. Kiểm tra mã màu Hex (cấm hardcode màu)
    const hexColorRegex = /#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
    let match;
    while ((match = hexColorRegex.exec(line)) !== null) {
      const colorVal = match[0].toLowerCase();
      // Cho phép màu trắng tinh (#fff, #ffffff) và đen tinh (#000, #000000)
      if (colorVal !== '#fff' && colorVal !== '#ffffff' && colorVal !== '#000' && colorVal !== '#000000') {
        // Kiểm tra xem có phải là anchor link hoặc id link không (ví dụ href="#add")
        const isAnchorLink = line.includes(`href="#${match[1]}"`) || 
                             line.includes(`href='#${match[1]}'`) ||
                             line.includes(`href={"#${match[1]}"}`) ||
                             line.includes(`href={'#${match[1]}'}`);
        if (!isAnchorLink) {
          errors.push({
            lineNum,
            content: rawLine.trim(),
            type: 'COLOR',
            message: `Cấm hardcode mã màu Hex (${match[0]}). Hãy sử dụng các class theme Tailwind hoặc CSS variables.`
          });
          break;
        }
      }
    }
  });

  if (errors.length > 0) {
    hasErrors = true;
    const relativePath = path.relative(ROOT_DIR, filePath);
    console.log(`\x1b[31m[LỖI] File: ${relativePath}\x1b[0m`);
    errors.forEach((err) => {
      console.log(`  \x1b[33mDòng ${err.lineNum}:\x1b[0m ${err.content}`);
      console.log(`    -> \x1b[36m${err.message}\x1b[0m`);
    });
    console.log('');
  }
}

function run() {
  console.log('--- BẮT ĐẦU KIỂM TRA QUY TẮC UI LINT ---');
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Không tìm thấy thư mục src tại: ${SRC_DIR}`);
    process.exit(1);
  }

  const files = getFilesRecursively(SRC_DIR);
  files.forEach(checkFile);

  if (hasErrors) {
    console.log('\x1b[31m❌ Kiểm tra thất bại! Hãy sửa các lỗi vi phạm thiết kế trên.\x1b[0m');
    process.exit(1);
  } else {
    console.log('\x1b[32m✔ Tất cả các file đều tuân thủ đúng quy tắc UI! (Không có inline SVG, thẻ button gốc và hardcode màu)\x1b[0m');
    process.exit(0);
  }
}

run();
