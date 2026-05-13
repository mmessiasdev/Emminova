import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const templatesRoot = path.join(projectRoot, 'public', 'templatesToConvert');
const outputRoot = path.join(projectRoot, 'public', 'templates-json');
const outputIndexFile = path.join(outputRoot, 'index.json');
const LANDSCAPE_TARGET = { width: 1920, height: 1080 };
const PORTRAIT_TARGET = { width: 1080, height: 1920 };
const SQUARE_TARGET = { width: 1080, height: 1080 };
const TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt-BR&dt=t&q=';

const translationCache = new Map();

function toSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function cleanTitle(value) {
  return value
    .replace(/\b(digital signage|tv template|template|landscape|portrait)\b/gi, '')
    .replace(/\s+-\s+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function inferCategory(folderName, sourceTitle) {
  const haystack = `${folderName} ${sourceTitle}`.toLowerCase();

  if (/(menu|coffee|brew|lunch|bakery|dessert|brunch|restaurant|smoothie|cafe|refreshment|combo|supermarket)/.test(haystack)) {
    return 'cardapio';
  }
  if (/(welcome|home|school|hiring|announcement|notice|alert|support|assistance|training|webinar|conference|open enrollment|benefits|employee)/.test(haystack)) {
    return 'comunicados';
  }
  if (/(sale|promo|offer|grand opening|appreciation|customer|special|deal|swap|mania|market)/.test(haystack)) {
    return 'campanhas';
  }
  if (/(service|auto|tire|business|living|display|dreams funded|retire)/.test(haystack)) {
    return 'institucional';
  }
  return 'custom';
}

function buildDescription(name, category) {
  const map = {
    cardapio: `Template de cardápio ${name.toLowerCase()} com composição fiel ao layout original.`,
    campanhas: `Template promocional ${name.toLowerCase()} convertido com fidelidade visual ao original.`,
    comunicados: `Template de comunicado ${name.toLowerCase()} convertido para o editor do sistema.`,
    institucional: `Template institucional ${name.toLowerCase()} convertido para uso direto no editor.`,
    custom: `Template ${name.toLowerCase()} convertido com fidelidade visual ao original.`,
  };
  return map[category] || map.custom;
}

function buildTags(folderName, translatedName, category) {
  const words = `${folderName} ${translatedName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 2 && !['landscape', 'portrait', 'template', 'digital', 'signage'].includes(part));

  return Array.from(new Set([category, ...words])).slice(0, 8);
}

function parseTranslatePayload(payload) {
  if (!Array.isArray(payload)) {
    return '';
  }

  return payload[0]
    ?.map((part) => Array.isArray(part) ? part[0] : '')
    .join('')
    .trim() || '';
}

function preserveCase(source, translated) {
  if (!source || !translated) {
    return translated;
  }

  const plainSource = source.replace(/[^A-Za-zÀ-ÿ]+/g, '');
  if (!plainSource) {
    return translated;
  }

  if (plainSource === plainSource.toUpperCase()) {
    return translated.toUpperCase();
  }

  if (plainSource === plainSource.toLowerCase()) {
    return translated.toLowerCase();
  }

  return translated;
}

async function translateText(value) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return value;
  }

  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed);
  }

  if (!/[A-Za-z]/.test(trimmed) || /^[@#]/.test(trimmed) || /^(https?:|www\.)/i.test(trimmed)) {
    translationCache.set(trimmed, value);
    return value;
  }

  const lines = trimmed.split('\n');
  const translatedLines = [];

  for (const line of lines) {
    const lineTrimmed = line.trim();
    if (!lineTrimmed || !/[A-Za-z]/.test(lineTrimmed) || /^[@#]/.test(lineTrimmed)) {
      translatedLines.push(line);
      continue;
    }

    const response = await fetch(`${TRANSLATE_URL}${encodeURIComponent(lineTrimmed)}`);
    if (!response.ok) {
      translatedLines.push(line);
      continue;
    }

    const payload = await response.json();
    const translated = parseTranslatePayload(payload) || lineTrimmed;
    translatedLines.push(preserveCase(lineTrimmed, translated));
  }

  const finalText = translatedLines.join('\n');
  translationCache.set(trimmed, finalText);
  return finalText;
}

function detectCanvasSize(source) {
  const styleMatch = source.match(/width:\s*(\d+)px[\s;]+height:\s*(\d+)px/i);
  if (styleMatch) {
    return { width: Number(styleMatch[1]), height: Number(styleMatch[2]) };
  }

  const utilityMatch = source.match(/w-\[(\d+)px\][\s\S]{0,120}?h-\[(\d+)px\]/i);
  if (utilityMatch) {
    return { width: Number(utilityMatch[1]), height: Number(utilityMatch[2]) };
  }

  const reversedMatch = source.match(/h-\[(\d+)px\][\s\S]{0,120}?w-\[(\d+)px\]/i);
  if (reversedMatch) {
    return { width: Number(reversedMatch[2]), height: Number(reversedMatch[1]) };
  }

  if (/portrait/i.test(source)) {
    return { width: 1080, height: 1920 };
  }

  return { width: 1920, height: 1080 };
}

function getTargetCanvasSize(sourceWidth, sourceHeight) {
  const ratio = sourceWidth / Math.max(sourceHeight, 1);
  if (Math.abs(ratio - 1) <= 0.08) {
    return SQUARE_TARGET;
  }

  return sourceHeight > sourceWidth ? PORTRAIT_TARGET : LANDSCAPE_TARGET;
}

function scaleShadow(shadow, scale) {
  if (!shadow) {
    return null;
  }

  return {
    x: Math.round(shadow.x * scale * 100) / 100,
    y: Math.round(shadow.y * scale * 100) / 100,
    blur: Math.round(shadow.blur * scale * 100) / 100,
    color: shadow.color,
  };
}

function scaleStroke(stroke, scale) {
  if (!stroke) {
    return null;
  }

  return {
    width: Math.max(1, Math.round(stroke.width * scale * 100) / 100),
    color: stroke.color,
  };
}

function scaleTemplate(template, sourceWidth, sourceHeight) {
  const target = getTargetCanvasSize(sourceWidth, sourceHeight);
  const scale = Math.min(target.width / sourceWidth, target.height / sourceHeight);
  const offsetX = Math.round((target.width - (sourceWidth * scale)) / 2);
  const offsetY = Math.round((target.height - (sourceHeight * scale)) / 2);
  const page = template.pages[0];

  page.elements = page.elements.map((element) => {
    const scaled = {
      ...element,
      x: Math.round((element.x * scale) + offsetX),
      y: Math.round((element.y * scale) + offsetY),
      width: Math.max(1, Math.round(element.width * scale)),
      height: Math.max(1, Math.round(element.height * scale)),
    };

    if (element.type === 'text') {
      scaled.properties = {
        ...element.properties,
        fontSize: Math.max(10, Math.round(element.properties.fontSize * scale)),
        letterSpacing: Math.round(element.properties.letterSpacing * scale * 100) / 100,
        shadow: scaleShadow(element.properties.shadow, scale),
        stroke: scaleStroke(element.properties.stroke, scale),
      };
    }

    if (element.type === 'shape') {
      scaled.properties = {
        ...element.properties,
        borderWidth: Math.round(element.properties.borderWidth * scale * 100) / 100,
        borderRadius: Math.round(element.properties.borderRadius * scale * 100) / 100,
        shadow: scaleShadow(element.properties.shadow, scale),
        backdropBlur: Math.round((element.properties.backdropBlur || 0) * scale * 100) / 100,
      };
    }

    if (element.type === 'image') {
      scaled.properties = {
        ...element.properties,
        borderRadius: Math.round(element.properties.borderRadius * scale * 100) / 100,
        borderWidth: Math.round(element.properties.borderWidth * scale * 100) / 100,
        shadow: scaleShadow(element.properties.shadow, scale),
      };
    }

    return scaled;
  });

  template.width = target.width;
  template.height = target.height;
  return template;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readExistingManifest() {
  try {
    const raw = await fs.readFile(outputIndexFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readDirectoriesWithHtml() {
  const entries = await fs.readdir(templatesRoot, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const htmlPath = path.join(templatesRoot, entry.name, 'code.html');
    try {
      await fs.access(htmlPath);
      result.push(entry.name);
    } catch {
      // ignore non-html folders
    }
  }

  return result.sort((first, second) => first.localeCompare(second));
}

function buildPageExtractor() {
  return (expectedSize) => {
    const TEXT_TAGS = new Set(['p', 'span', 'strong', 'em', 'small', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'figcaption', 'a', 'button']);
    const ICON_CLASS = 'material-symbols-outlined';
    const NAMED_COLOR_PATTERN = /\b(?:transparent|black|white|red|green|blue|yellow|orange|brown|gray|grey|gold|silver|beige|ivory|navy|teal|maroon|purple|pink|cyan|magenta)\b/i;

    const parseNumeric = (value, fallback = 0) => {
      const parsed = Number.parseFloat(value || '');
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const normalizeColor = (value) => (value || '').trim();
    const isTransparent = (value) => {
      const normalized = normalizeColor(value).replace(/\s+/g, '').toLowerCase();
      return !normalized || normalized === 'transparent' || normalized === 'rgba(0,0,0,0)';
    };
    const simplifyFontFamily = (value) => (value || '').split(',')[0]?.replace(/['"]/g, '').trim() || 'Inter';
    const normalizeText = (value) => (value || '').replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const parseRotation = (value) => {
      if (!value || value === 'none') {
        return 0;
      }

      const rotateMatch = value.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/i);
      if (rotateMatch) {
        return Math.round(parseNumeric(rotateMatch[1]) * 100) / 100;
      }

      const matrixMatch = value.match(/matrix\(([^)]+)\)/i);
      if (!matrixMatch) {
        return 0;
      }

      const values = matrixMatch[1].split(',').map((part) => parseNumeric(part.trim(), Number.NaN));
      const [a, b] = values;
      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        return 0;
      }

      return Math.round((Math.atan2(b, a) * 180) / Math.PI * 100) / 100;
    };
    const extractColorToken = (value) => {
      if (!value) {
        return null;
      }

      const functional = value.match(/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8})/i);
      if (functional?.[1]) {
        return functional[1];
      }

      const named = value.match(NAMED_COLOR_PATTERN);
      return named?.[0] || null;
    };
    const parseShadow = (value) => {
      if (!value || value === 'none') {
        return null;
      }

      const colorMatch = extractColorToken(value);
      const numbers = value.replace(colorMatch || '', '').match(/-?\d+(\.\d+)?/g) || [];
      if (numbers.length < 3) {
        return null;
      }

      return {
        x: Number(numbers[0]),
        y: Number(numbers[1]),
        blur: Number(numbers[2]),
        color: colorMatch || 'rgba(0,0,0,0.35)',
      };
    };
    const parseLineHeight = (style) => {
      if (!style.lineHeight || style.lineHeight === 'normal') {
        return 1.2;
      }

      const fontSize = parseNumeric(style.fontSize, 16);
      const lineHeight = parseNumeric(style.lineHeight, fontSize * 1.2);
      return fontSize > 0 ? lineHeight / fontSize : 1.2;
    };
    const parseBorderRadius = (style) => {
      const values = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius]
        .map((part) => parseNumeric(part))
        .filter((part) => part > 0);
      return values.length ? Math.max(...values) : 0;
    };
    const extractBlur = (value) => parseNumeric(value?.match(/blur\(([\d.]+)px\)/i)?.[1], 0);
    const splitGradientArgs = (value) => {
      const parts = [];
      let current = '';
      let depth = 0;
      for (const char of value) {
        if (char === '(') depth += 1;
        if (char === ')') depth -= 1;
        if (char === ',' && depth === 0) {
          parts.push(current.trim());
          current = '';
          continue;
        }
        current += char;
      }
      if (current.trim()) {
        parts.push(current.trim());
      }
      return parts;
    };
    const directionToAngle = (value) => {
      const normalized = (value || '').trim().toLowerCase();
      if (normalized === 'to top') return 0;
      if (normalized === 'to right') return 90;
      if (normalized === 'to bottom') return 180;
      if (normalized === 'to left') return 270;
      if (normalized === 'to top right' || normalized === 'to right top') return 45;
      if (normalized === 'to bottom right' || normalized === 'to right bottom') return 135;
      if (normalized === 'to bottom left' || normalized === 'to left bottom') return 225;
      if (normalized === 'to top left' || normalized === 'to left top') return 315;
      return 180;
    };
    const mapGradientStops = (stops) => stops
      .map((stop, index) => {
        const color = extractColorToken(stop);
        if (!color) {
          return null;
        }

        const offsetMatch = stop.match(/(\d+(?:\.\d+)?)%/);
        return {
          color,
          offset: offsetMatch ? Math.max(0, Math.min(1, Number(offsetMatch[1]) / 100)) : (stops.length === 1 ? 0 : index / (stops.length - 1)),
        };
      })
      .filter(Boolean);
    const parseGradient = (value) => {
      if (!value || value === 'none') {
        return null;
      }

      const linearMatch = value.match(/linear-gradient\(([\s\S]+)\)/i);
      if (linearMatch) {
        const args = splitGradientArgs(linearMatch[1]);
        let angle = 180;
        let stops = args;
        if (/deg/.test(args[0] || '')) {
          angle = parseNumeric(args[0], 180);
          stops = args.slice(1);
        } else if (/^to\s+/i.test(args[0] || '')) {
          angle = directionToAngle(args[0]);
          stops = args.slice(1);
        }
        const parsedStops = mapGradientStops(stops);
        return parsedStops.length >= 2 ? {
          type: 'linear',
          angle,
          stops: parsedStops,
        } : null;
      }

      const radialMatch = value.match(/radial-gradient\(([\s\S]+)\)/i);
      if (radialMatch) {
        const args = splitGradientArgs(radialMatch[1]);
        const parsedStops = mapGradientStops(args);
        return parsedStops.length >= 2 ? {
          type: 'radial',
          angle: 0,
          stops: parsedStops,
        } : null;
      }

      return null;
    };
    const parseBackgroundUrl = (value) => {
      if (!value || value === 'none') {
        return null;
      }
      const match = value.match(/url\((["']?)([^"')]+)\1\)/i);
      return match?.[2] || null;
    };
    const hasVisibleBox = (style, rect) => rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && parseNumeric(style.opacity, 1) > 0;
    const hasRenderableBox = (style) => {
      const webkitBackdropFilter = style.webkitBackdropFilter || '';
      return Boolean(
        !isTransparent(style.backgroundColor)
        || style.backgroundImage !== 'none'
        || parseNumeric(style.borderTopWidth) > 0
        || parseNumeric(style.borderRightWidth) > 0
        || parseNumeric(style.borderBottomWidth) > 0
        || parseNumeric(style.borderLeftWidth) > 0
        || style.boxShadow !== 'none'
        || style.backdropFilter !== 'none'
        || (webkitBackdropFilter && webkitBackdropFilter !== 'none')
      );
    };
    const getBounds = (node, rootRect) => {
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round((rect.left - rootRect.left) * 100) / 100,
        y: Math.round((rect.top - rootRect.top) * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      };
    };
    const isFullCanvas = (bounds, width, height) => Math.abs(bounds.x) <= 2
      && Math.abs(bounds.y) <= 2
      && Math.abs(bounds.width - width) <= 4
      && Math.abs(bounds.height - height) <= 4;
    const getDepth = (node) => {
      let depth = 0;
      let current = node;
      while (current?.parentElement) {
        depth += 1;
        current = current.parentElement;
      }
      return depth;
    };
    const expectedWidth = Math.round(expectedSize?.width || window.innerWidth || document.documentElement.clientWidth || 1920);
    const expectedHeight = Math.round(expectedSize?.height || window.innerHeight || document.documentElement.clientHeight || 1080);
    const candidateNodes = Array.from(new Set([
      document.querySelector('[data-import-root="true"]'),
      document.querySelector('main'),
      ...Array.from(document.body.children),
      document.body,
      document.documentElement,
    ].filter((node) => node instanceof HTMLElement)));
    const root = candidateNodes
      .map((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 100) {
          return null;
        }

        const style = getComputedStyle(node);
        const sizeDelta = Math.abs(rect.width - expectedWidth) + Math.abs(rect.height - expectedHeight);
        const offsetDelta = Math.abs(rect.left) + Math.abs(rect.top);
        const semanticBonus = (node.matches?.('[data-import-root="true"]') ? 120 : 0)
          + (node.tagName.toLowerCase() === 'main' ? 80 : 0);
        const backgroundBonus = hasRenderableBox(style) ? 30 : 0;
        const bodyPenalty = node === document.documentElement ? 12 : node === document.body ? 6 : 0;
        const score = sizeDelta + offsetDelta + (getDepth(node) * 4) + bodyPenalty - semanticBonus - backgroundBonus;

        return { node, score };
      })
      .filter(Boolean)
      .sort((first, second) => first.score - second.score)[0]?.node || document.body;

    const rootRect = root.getBoundingClientRect();
    const rootStyle = getComputedStyle(root);
    const elements = [];
    const imageTargets = [];
    const consumed = new Set();
    let zIndex = 0;
    let imageCount = 0;
    const ancestry = [];
    let current = root;
    while (current) {
      ancestry.push(current);
      current = current.parentElement;
    }

    const buildBackground = (style) => {
      const gradient = parseGradient(style.backgroundImage);
      if (gradient) {
        return {
          type: 'gradient',
          color: !isTransparent(style.backgroundColor) ? style.backgroundColor : 'rgba(0, 0, 0, 0)',
          gradient,
          imageSrc: null,
        };
      }

      if (!isTransparent(style.backgroundColor)) {
        return {
          type: 'solid',
          color: style.backgroundColor,
          gradient: null,
          imageSrc: null,
        };
      }

      return null;
    };

    let background = ancestry
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const bounds = node === root
          ? { x: 0, y: 0, width: rootRect.width, height: rootRect.height }
          : {
            x: rect.left - rootRect.left,
            y: rect.top - rootRect.top,
            width: rect.width,
            height: rect.height,
          };

        if (node !== root && !isFullCanvas(bounds, rootRect.width, rootRect.height)) {
          return null;
        }

        return buildBackground(getComputedStyle(node));
      })
      .find(Boolean);

    const descendants = Array.from(root.querySelectorAll('*'));
    if (!background) {
      for (const node of descendants) {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const bounds = getBounds(node, rootRect);
        if (!hasVisibleBox(style, rect) || !isFullCanvas(bounds, rootRect.width, rootRect.height)) {
          continue;
        }

        const candidateBackground = buildBackground(style);
        if (!candidateBackground) {
          continue;
        }

        background = candidateBackground;
        consumed.add(node);
        break;
      }
    }

    if (!background) {
      background = {
        type: 'solid',
        color: !isTransparent(rootStyle.backgroundColor) ? rootStyle.backgroundColor : '#111111',
        gradient: null,
        imageSrc: null,
      };
    }

    descendants.forEach((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      if (!hasVisibleBox(style, rect)) {
        return;
      }

      const tag = node.tagName.toLowerCase();
      const bounds = getBounds(node, rootRect);
      if (bounds.width < 1 || bounds.height < 1) {
        return;
      }

      const isImg = node instanceof HTMLImageElement;
      const isMaterialIcon = node.classList.contains(ICON_CLASS);
      const backgroundUrl = parseBackgroundUrl(style.backgroundImage);
      const isSvg = tag === 'svg';

      if (isImg || isMaterialIcon || backgroundUrl || isSvg) {
        const id = `img-${imageCount += 1}`;
        node.setAttribute('data-conv-id', id);
        imageTargets.push({
          id,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          alt: isImg ? (node.getAttribute('alt') || `Imagem ${imageCount}`) : `Imagem ${imageCount}`,
          fit: isImg
            ? ((style.objectFit === 'contain' || style.objectFit === 'fill' || style.objectFit === 'none') ? style.objectFit : 'cover')
            : (style.backgroundSize === 'contain' ? 'contain' : (style.backgroundSize === '100% 100%' ? 'fill' : 'cover')),
          borderRadius: parseBorderRadius(style),
          borderWidth: Math.max(parseNumeric(style.borderTopWidth), parseNumeric(style.borderRightWidth), parseNumeric(style.borderBottomWidth), parseNumeric(style.borderLeftWidth)),
          borderColor: style.borderTopColor || '#000000',
          shadow: parseShadow(style.boxShadow) || parseShadow(style.filter),
          opacity: parseNumeric(style.opacity, 1),
          rotation: parseRotation(style.transform),
          zIndex: zIndex++,
        });
        consumed.add(node);
        return;
      }

      const innerText = normalizeText(node.innerText || '');
      const directText = normalizeText(Array.from(node.childNodes)
        .filter((child) => child.nodeType === Node.TEXT_NODE || child.nodeName === 'BR')
        .map((child) => child.nodeName === 'BR' ? '\n' : child.textContent || '')
        .join(''));
      const isTextTag = TEXT_TAGS.has(tag);
      const hasText = Boolean(innerText);
      const hasChildTextTag = Array.from(node.children).some((child) => TEXT_TAGS.has(child.tagName.toLowerCase()) && normalizeText(child.innerText || ''));

      if ((isTextTag || (hasText && !hasChildTextTag && Array.from(node.children).every((child) => child.tagName === 'BR'))) && !consumed.has(node)) {
        const content = directText || innerText;
        if (content) {
          const sourceNodeId = `text-src-${elements.length + 1}`;
          node.setAttribute('data-conv-text-id', sourceNodeId);
          elements.push({
            id: `text-${elements.length + 1}`,
            type: 'text',
            name: `Texto ${elements.length + 1}`,
            sourceNodeId,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            rotation: parseRotation(style.transform),
            opacity: parseNumeric(style.opacity, 1),
            locked: false,
            visible: true,
            zIndex: zIndex++,
            groupId: null,
            properties: {
              content,
              fontFamily: simplifyFontFamily(style.fontFamily),
              fontSize: parseNumeric(style.fontSize, 16),
              fontWeight: parseNumeric(style.fontWeight, 400),
              fontStyle: style.fontStyle === 'italic' ? 'italic' : 'normal',
              color: style.color || '#FFFFFF',
              alignment: ['center', 'right', 'justify'].includes(style.textAlign) ? style.textAlign : 'left',
              verticalAlign: style.display === 'flex' && style.alignItems === 'center' ? 'middle' : 'top',
              lineHeight: parseLineHeight(style),
              letterSpacing: parseNumeric(style.letterSpacing),
              textDecoration: (style.textDecorationLine || '').includes('underline') ? 'underline' : (style.textDecorationLine || '').includes('line-through') ? 'line-through' : 'none',
              textTransform: ['uppercase', 'lowercase', 'capitalize'].includes(style.textTransform) ? style.textTransform : 'none',
              shadow: parseShadow(style.textShadow),
              stroke: null,
              textStyle: /^h\d$/.test(tag) ? 'title' : tag === 'p' ? 'paragraph' : 'free',
            },
          });
          consumed.add(node);
          return;
        }
      }

      const gradient = parseGradient(style.backgroundImage);
      const fill = style.backgroundColor;
      const borderWidth = Math.max(parseNumeric(style.borderTopWidth), parseNumeric(style.borderRightWidth), parseNumeric(style.borderBottomWidth), parseNumeric(style.borderLeftWidth));
      const hasShape = gradient || !isTransparent(fill) || borderWidth > 0 || extractBlur(style.backdropFilter || style.webkitBackdropFilter) > 0 || !!style.boxShadow;

      if (hasShape && !consumed.has(node)) {
        let shapeType = 'rectangle';
        const radius = parseBorderRadius(style);
        if (Math.abs(bounds.width - bounds.height) <= Math.max(8, bounds.width * 0.08) && radius >= Math.min(bounds.width, bounds.height) * 0.35) {
          shapeType = 'circle';
        } else if (bounds.height <= 8 && (borderWidth > 0 || !isTransparent(fill) || gradient || node.tagName.toLowerCase() === 'hr')) {
          shapeType = 'line';
        }

        const shapeElement = {
          id: `shape-${elements.length + 1}`,
          type: 'shape',
          name: `Forma ${elements.length + 1}`,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          rotation: parseRotation(style.transform),
          opacity: parseNumeric(style.opacity, 1),
          locked: false,
          visible: true,
          zIndex: zIndex++,
          groupId: null,
          properties: {
            shapeType,
            fill: gradient ? 'rgba(0,0,0,0)' : (fill || 'transparent'),
            gradient,
            borderWidth: shapeType === 'line' && borderWidth === 0 && !isTransparent(fill) ? Math.max(2, Math.round(bounds.height)) : (borderWidth || 0),
            borderColor: style.borderTopColor || '#000000',
            borderRadius: shapeType === 'line' ? 0 : radius,
            borderStyle: ['dashed', 'dotted'].includes(style.borderTopStyle) ? style.borderTopStyle : 'solid',
            shadow: parseShadow(style.boxShadow),
            backdropBlur: extractBlur(style.backdropFilter || style.webkitBackdropFilter),
          },
        };

        const isEffectivelyInvisible = !shapeElement.properties.gradient
          && isTransparent(shapeElement.properties.fill)
          && shapeElement.properties.borderWidth === 0
          && !shapeElement.properties.shadow
          && !shapeElement.properties.backdropBlur;

        if (!isEffectivelyInvisible) {
          elements.push(shapeElement);
        }
      }
    });

    const pageElements = [
      ...elements,
      ...imageTargets.map((target, index) => ({
        id: target.id,
        type: 'image',
        name: `Imagem ${index + 1}`,
        x: target.x,
        y: target.y,
        width: target.width,
        height: target.height,
        rotation: target.rotation,
        opacity: target.opacity,
        locked: false,
        visible: true,
        zIndex: target.zIndex,
        groupId: null,
        properties: {
          src: '',
          alt: target.alt,
          fit: target.fit,
          borderRadius: target.borderRadius,
          borderWidth: target.borderWidth,
          borderColor: target.borderColor,
          shadow: target.shadow,
          filter: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            grayscale: 0,
          },
        },
      })),
    ].sort((a, b) => a.zIndex - b.zIndex);

    return {
      sourceWidth: expectedWidth,
      sourceHeight: expectedHeight,
      title: document.title || '',
      background,
      elements: pageElements,
      imageTargets,
    };
  };
}

async function captureElementAsset(page, target, assetPath) {
  const locator = page.locator(`[data-conv-id="${target.id}"]`);
  await locator.evaluate((node) => {
    const root = document.body;
    for (const child of Array.from(root.querySelectorAll('*'))) {
      if (child !== node && !child.contains(node)) {
        child.setAttribute('data-conv-hidden', 'true');
      }
    }
    root.querySelectorAll('[data-conv-hidden="true"]').forEach((el) => {
      el.dataset.convPreviousVisibility = el.style.visibility || '';
      el.style.visibility = 'hidden';
    });
    document.documentElement.dataset.convPreviousBackground = document.documentElement.style.background || '';
    document.body.dataset.convPreviousBackground = document.body.style.background || '';
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
  });

  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) {
    return;
  }

  const x = Math.max(0, box.x);
  const y = Math.max(0, box.y);
  const right = Math.min(viewport.width, box.x + box.width);
  const bottom = Math.min(viewport.height, box.y + box.height);
  const width = right - x;
  const height = bottom - y;

  if (width <= 0 || height <= 0) {
    await page.evaluate(() => {
      document.querySelectorAll('[data-conv-hidden="true"]').forEach((el) => {
        el.style.visibility = el.dataset.convPreviousVisibility || '';
        delete el.dataset.convPreviousVisibility;
        delete el.dataset.convHidden;
      });
      document.documentElement.style.background = document.documentElement.dataset.convPreviousBackground || '';
      document.body.style.background = document.body.dataset.convPreviousBackground || '';
      delete document.documentElement.dataset.convPreviousBackground;
      delete document.body.dataset.convPreviousBackground;
    });
    return false;
  }

  await page.screenshot({
    path: assetPath,
    omitBackground: true,
    clip: { x, y, width, height },
  });

  await page.evaluate(() => {
    document.querySelectorAll('[data-conv-hidden="true"]').forEach((el) => {
      el.style.visibility = el.dataset.convPreviousVisibility || '';
      delete el.dataset.convPreviousVisibility;
      delete el.dataset.convHidden;
    });
    document.documentElement.style.background = document.documentElement.dataset.convPreviousBackground || '';
    document.body.style.background = document.body.dataset.convPreviousBackground || '';
    delete document.documentElement.dataset.convPreviousBackground;
    delete document.body.dataset.convPreviousBackground;
  });

  return true;
}

async function buildTemplateData(folderName, pageExtraction) {
  const rawTitle = cleanTitle(pageExtraction.title || folderName.replace(/[_-]+/g, ' '));
  const translatedTitle = titleCase(await translateText(rawTitle || folderName));
  const id = toSlug(translatedTitle || folderName);
  const category = inferCategory(folderName, translatedTitle);
  const now = new Date().toISOString();

  const template = {
    id,
    name: translatedTitle,
    description: buildDescription(translatedTitle, category),
    category,
    width: pageExtraction.sourceWidth,
    height: pageExtraction.sourceHeight,
    pages: [
      {
        id: `${id}-page-1`,
        name: 'Slide 1',
        elements: pageExtraction.elements.map((element, index) => ({
          ...element,
          id: `${id}-${element.id}-${index + 1}`,
        })),
        background: pageExtraction.background,
        duration: 15,
      },
    ],
    createdAt: now,
    updatedAt: now,
    author: 'Sistema',
    favorite: false,
    thumbnail: `/templatesToConvert/${folderName}/screen.png`,
    tags: buildTags(folderName, translatedTitle, category),
  };

  return template;
}

function isPriceContent(value) {
  return /\b(\$|usd|eur|r\$)?\s?\d+[.,]\d{2}\b/i.test(value);
}

function getAdjustedPriceFontSize(fontSize) {
  if (fontSize <= 28) {
    return 44;
  }

  if (fontSize <= 36) {
    return 48;
  }

  return fontSize;
}

async function translateAndFitTextElements(page, template, sourceWidth) {
  for (const element of template.pages[0].elements) {
    if (element.type !== 'text') {
      continue;
    }

    const originalContent = element.properties.content;
    const translated = await translateText(originalContent);
    element.properties.content = translated;

    if (isPriceContent(translated)) {
      element.properties.fontSize = getAdjustedPriceFontSize(element.properties.fontSize);
    }

    if (translated.length > originalContent.length * 1.25) {
      element.properties.fontSize = Math.max(14, Math.round(element.properties.fontSize * 0.92));
    }

    if (!element.sourceNodeId) {
      continue;
    }

    const measured = await page.evaluate((payload) => {
      const source = document.querySelector(`[data-conv-text-id="${payload.nodeId}"]`);
      if (!(source instanceof HTMLElement)) {
        return null;
      }

      let root = document.getElementById('__conv-measure-root');
      if (!root) {
        root = document.createElement('div');
        root.id = '__conv-measure-root';
        root.style.position = 'fixed';
        root.style.left = '-100000px';
        root.style.top = '0';
        root.style.width = '0';
        root.style.height = '0';
        root.style.pointerEvents = 'none';
        root.style.opacity = '0';
        root.style.overflow = 'hidden';
        document.body.appendChild(root);
      }

      const computed = getComputedStyle(source);
      const createProbe = (mode) => {
        const probe = document.createElement('div');
        probe.style.position = 'absolute';
        probe.style.left = '0';
        probe.style.top = '0';
        probe.style.boxSizing = 'border-box';
        probe.style.fontFamily = payload.fontFamily || computed.fontFamily;
        probe.style.fontSize = `${payload.fontSize}px`;
        probe.style.fontWeight = String(payload.fontWeight ?? computed.fontWeight);
        probe.style.fontStyle = payload.fontStyle || computed.fontStyle;
        probe.style.letterSpacing = `${payload.letterSpacing}px`;
        probe.style.lineHeight = `${payload.fontSize * payload.lineHeight}px`;
        probe.style.whiteSpace = mode === 'natural' ? 'pre' : 'pre-wrap';
        probe.style.wordBreak = computed.wordBreak;
        probe.style.overflowWrap = computed.overflowWrap;
        probe.style.paddingTop = computed.paddingTop;
        probe.style.paddingRight = computed.paddingRight;
        probe.style.paddingBottom = computed.paddingBottom;
        probe.style.paddingLeft = computed.paddingLeft;
        probe.style.textTransform = payload.textTransform === 'none' ? 'none' : payload.textTransform;
        probe.style.width = mode === 'natural' ? 'max-content' : `${Math.max(1, payload.width)}px`;
        probe.style.maxWidth = mode === 'natural' ? 'none' : `${Math.max(1, payload.width)}px`;
        probe.textContent = payload.content;
        return probe;
      };

      const constrained = createProbe('constrained');
      const natural = createProbe('natural');
      root.appendChild(constrained);
      root.appendChild(natural);

      const constrainedRect = constrained.getBoundingClientRect();
      const naturalRect = natural.getBoundingClientRect();
      const measured = {
        height: Math.ceil(Math.max(constrained.scrollHeight, constrainedRect.height) + 2),
        width: Math.ceil(Math.max(constrained.scrollWidth, naturalRect.width) + 2),
        naturalWidth: Math.ceil(naturalRect.width + 2),
        nowrap: computed.whiteSpace.includes('nowrap'),
      };

      constrained.remove();
      natural.remove();

      return measured;
    }, {
      nodeId: element.sourceNodeId,
      content: translated,
      width: element.width,
      fontFamily: element.properties.fontFamily,
      fontSize: element.properties.fontSize,
      fontWeight: element.properties.fontWeight,
      fontStyle: element.properties.fontStyle,
      letterSpacing: element.properties.letterSpacing,
      lineHeight: element.properties.lineHeight,
      textTransform: element.properties.textTransform,
    });

    if (!measured) {
      continue;
    }

    element.height = Math.max(element.height, measured.height);

    const singleLine = !translated.includes('\n');
    if ((measured.nowrap || singleLine) && measured.naturalWidth > element.width + 2) {
      const maxCanvasWidth = Math.max(1, sourceWidth - element.x);
      element.width = Math.min(maxCanvasWidth, Math.max(element.width, measured.naturalWidth));
    }
  }
}

function stripInternalFields(template) {
  template.pages = template.pages.map((page) => ({
    ...page,
    elements: page.elements.map((element) => {
      const { sourceNodeId, ...cleanElement } = element;
      return cleanElement;
    }),
  }));

  return template;
}

async function convertFolder(browser, folderName) {
  const folderPath = path.join(templatesRoot, folderName);
  const htmlPath = path.join(folderPath, 'code.html');
  const htmlSource = await fs.readFile(htmlPath, 'utf8');
  const size = detectCanvasSize(htmlSource);

  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await page.addStyleTag({
      content: `
        *,
        *::before,
        *::after {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
          caret-color: transparent !important;
        }
      `,
    });
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await Promise.all(
        Array.from(document.images)
          .filter((image) => !image.complete)
          .map((image) => new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })),
      );
    });

    const extraction = await page.evaluate(buildPageExtractor(), size);
    const template = await buildTemplateData(folderName, extraction);
    await translateAndFitTextElements(page, template, extraction.sourceWidth);
    const finalTemplate = stripInternalFields(scaleTemplate(template, extraction.sourceWidth, extraction.sourceHeight));
    const assetDir = path.join(folderPath, 'generated-assets');
    await ensureDir(assetDir);

    for (const target of extraction.imageTargets) {
      const element = finalTemplate.pages[0].elements.find((item) => item.type === 'image' && item.id.includes(target.id));
      const assetFileName = `${target.id}.png`;
      const assetPath = path.join(assetDir, assetFileName);
      const captured = await captureElementAsset(page, target, assetPath);
      if (captured && element) {
        element.properties.src = `/templatesToConvert/${folderName}/generated-assets/${assetFileName}`;
      } else if (element) {
        finalTemplate.pages[0].elements = finalTemplate.pages[0].elements.filter((item) => item.id !== element.id);
      }
    }

    const outputPath = path.join(outputRoot, `${finalTemplate.id}.json`);
    await fs.writeFile(outputPath, JSON.stringify(finalTemplate, null, 2));

    return {
      id: finalTemplate.id,
      name: finalTemplate.name,
      description: finalTemplate.description,
      category: finalTemplate.category,
      width: finalTemplate.width,
      height: finalTemplate.height,
      thumbnail: finalTemplate.thumbnail,
      tags: finalTemplate.tags,
      file: `/templates-json/${finalTemplate.id}.json`,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  await ensureDir(outputRoot);
  const requestedFolders = process.argv.slice(2).filter(Boolean);
  const isPartialRun = requestedFolders.length > 0;
  const folders = requestedFolders.length > 0 ? requestedFolders : await readDirectoriesWithHtml();
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const manifest = [];

  try {
    for (const folderName of folders) {
      console.log(`Converting ${folderName}...`);
      const entry = await convertFolder(browser, folderName);
      manifest.push(entry);
    }
  } finally {
    await browser.close();
  }

  let finalManifest = manifest;

  if (isPartialRun) {
    const existingManifest = await readExistingManifest();
    const manifestById = new Map(existingManifest.map((entry) => [entry.id, entry]));
    for (const entry of manifest) {
      manifestById.set(entry.id, entry);
    }

    finalManifest = Array.from(manifestById.values())
      .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
  } else {
    const manifestFiles = new Set(manifest.map((entry) => path.basename(entry.file)));
    const existingOutputFiles = await fs.readdir(outputRoot, { withFileTypes: true });
    await Promise.all(existingOutputFiles
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json' && !manifestFiles.has(entry.name))
      .map((entry) => fs.unlink(path.join(outputRoot, entry.name))));
  }

  await fs.writeFile(outputIndexFile, JSON.stringify(finalManifest, null, 2));
  console.log(`Converted ${manifest.length} templates.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
