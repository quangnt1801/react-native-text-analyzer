import { extractProductFromText } from './ExtractProduct';

interface ExtractTextProps {
  input: string;
}

export function ExtractText({ input }: ExtractTextProps) {
  function normalizeMoneyString(input?: string): string | null {
    if (!input) return null;

    let raw = input
      .toLowerCase()
      .replace(/[^\w\d\s.,đ₫vnđ]/g, '')
      .trim();

    const specialMillionMap: Record<string, number> = {
      'mốt': 0.1,
      'mốt triệu': 0.1,
      'rưỡi': 0.5,
      'hai': 0.2,
      'ba': 0.3,
      'bốn': 0.4,
      'năm': 0.5,
      'sáu': 0.6,
      'bảy': 0.7,
      'tám': 0.8,
      'chín': 0.9,
    };

    const specialPattern =
      /(\d+)\s*triệu\s*(mốt|rưỡi|hai|ba|bốn|năm|sáu|bảy|tám|chín)?/;
    const specialMatch: any = input.match(specialPattern);
    if (specialMatch) {
      const base = parseInt(specialMatch[1]);
      const extraWord = specialMatch[2] || '';
      const extra = specialMillionMap[extraWord] || 0;
      return Math.round((base + extra) * 1_000_000).toString();
    }

    const moneyWithDotPattern =
      /^(\d{1,3}(?:[.,]\d{3})+)(?:\s?(đ|₫|vnđ|vnd|đồng))?$/i;
    const matchMoneyWithDot: any = raw.match(moneyWithDotPattern);
    if (matchMoneyWithDot) {
      const numberStr = matchMoneyWithDot[1].replace(/[.,]/g, '');
      return numberStr;
    }

    const shorthandMillion = /^(\d+(?:[.,]?\d*)?)\s*tr(?:iệu)?(\d{1,3})?$/;
    const shorthandBillion = /^(\d+(?:[.,]?\d*)?)\s*t(?:ỷ|y)(\d{1,3})?$/;

    const mMatch: any = raw.match(shorthandMillion);
    if (mMatch) {
      const million = parseFloat(mMatch[1].replace(',', '.'));
      const extraStr = mMatch[2] || '';
      let extra = 0;

      if (extraStr.length === 1) extra = parseInt(extraStr) * 100_000;
      else if (extraStr.length === 2) extra = parseInt(extraStr) * 10_000;
      else if (extraStr.length === 3) extra = parseInt(extraStr);

      return Math.round(million * 1_000_000 + extra).toString();
    }

    const bMatch: any = raw.match(shorthandBillion);
    if (bMatch) {
      const billion = parseFloat(bMatch[1].replace(',', '.'));
      const extraStr = bMatch[2] || '';
      let extra = 0;

      if (extraStr.length === 1) extra = parseInt(extraStr) * 100_000_000;
      else if (extraStr.length === 2) extra = parseInt(extraStr) * 10_000_000;
      else if (extraStr.length === 3) extra = parseInt(extraStr);

      return Math.round(billion * 1_000_000_000 + extra).toString();
    }

    const weightKgPattern = /^(\d+(?:[.,]?\d*)?)\s*kg$/;
    const weightGPattern = /^(\d+(?:[.,]?\d*)?)\s*g$/;

    const matchKg: any = raw.match(weightKgPattern);
    if (matchKg) {
      const value = parseFloat(matchKg[1].replace(',', '.'));
      return Math.round(value * 1000).toString();
    }

    const matchG: any = raw.match(weightGPattern);
    if (matchG) {
      const value = parseFloat(matchG[1].replace(',', '.'));
      return Math.round(value).toString();
    }

    const millionPattern =
      /(\d+(?:[.,]\d+)?)\s*triệu(?:\s+(\d+(?:[.,]\d+)?)(?:\s*(nghìn|ngàn|k))?)?/;
    const millionMatch: any = raw.match(millionPattern);
    if (millionMatch) {
      const millions = parseFloat(millionMatch[1].replace(',', '.'));
      const extra = millionMatch[2]
        ? parseFloat(millionMatch[2].replace(',', '.'))
        : 0;
      const extraUnit = millionMatch[3] || '';

      const extraValue =
        extra *
        (/nghìn|ngàn|k/.test(extraUnit)
          ? 1_000
          : extra < 100
            ? 100_000
            : 1_000);

      return Math.round(millions * 1_000_000 + extraValue).toString();
    }

    const billionPattern = /(\d+(?:[.,]\d+)?)\s*t[ỷy](?:\s+(\d+(?:[.,]\d+)?))?/;
    const billionMatch: any = raw.match(billionPattern);
    if (billionMatch) {
      const billions = parseFloat(billionMatch[1].replace(',', '.'));
      const extra = billionMatch[2]
        ? parseFloat(billionMatch[2].replace(',', '.'))
        : 0;
      return Math.round(
        billions * 1_000_000_000 + (extra > 0 ? extra * 100_000_000 : 0)
      ).toString();
    }

    const shortKPattern = /(\d+(?:[.,]?\d*)?)\s*k\b/;
    const shortKMatch: any = raw.match(shortKPattern);
    if (shortKMatch) {
      const num = parseFloat(shortKMatch[1].replace(',', '.'));
      return Math.round(num * 1_000).toString();
    }

    let cleaned = raw.replace(/,/g, '.').replace(/[^\d.]/g, '');
    let num = parseFloat(cleaned);

    if (/\b(triệu|trieu|tr)\b/.test(raw)) num *= 1_000_000;
    else if (/tỷ/.test(raw)) num *= 1_000_000_000;
    else if (/\b(k|nghin|ngan|nghìn|ngàn)\b/.test(input)) num *= 1_000;

    return isNaN(num) ? null : Math.round(num).toString();
  }

  const extractPhone = (
    text: string
  ): { phone?: string; cleanedText: string } => {
    // Regex với từ khóa, cho phép dấu phân cách . - khoảng trắng giữa các số
    const phoneRegexWithKeyword =
      /(?:sđt|số điện thoại|điện thoại|phone|so dien thoai|dien thoai|SDT:|SĐT|dThoai|Gửi tới số điện thoại|Ship giúp|sdt|Sdt)[^\d]*(0[\d.\-\s\*xX]{6,})/i;

    const matchWithKeyword: any = text.match(phoneRegexWithKeyword);
    if (matchWithKeyword) {
      // Loại bỏ dấu ., -, khoảng trắng trong số điện thoại
      const phoneCleaned = matchWithKeyword[1].replace(/[.\-\s]/g, '');
      return {
        phone: phoneCleaned,
        cleanedText: text.replace(matchWithKeyword[0], '').trim(),
      };
    }

    // Regex không có từ khóa, cho phép dấu phân cách . - khoảng trắng
    const phoneRegex = /\b(0[\d.\-\s\*xX]{6,})\b/;
    const matchDirect: any = text.match(phoneRegex);
    if (matchDirect) {
      const phoneCleaned = matchDirect[1].replace(/[.\-\s]/g, '');
      return {
        phone: phoneCleaned,
        cleanedText: text.replace(matchDirect[0], '').trim(),
      };
    }

    return { cleanedText: text.trim() };
  };

  function extractCodWithNormalizedValue(text: string): {
    codRaw?: string;
    codValue?: number;
    cleanedCod: string;
  } {
    const codKeywords = [
      'thu hộ',
      'thu',
      'COD',
      'tiền thu',
      'tiền thu hộ',
      'cần thu',
      'khách trả',
      'khách thanh toán',
      'giá tiền',
      'tổng tiền',
      'thành tiền',
      'th',
    ];

    const codSpecialPattern = new RegExp(
      `(thu hộ|thu|COD|tiền thu|tiền thu hộ|cần thu|khách trả|khách thanh toán|giá tiền|tổng tiền|thành tiền|th|COD:)?\\s*(\\d+)\\s*triệu\\s*(rưỡi|mốt|hai|ba|bốn|năm|sáu|bảy|tám|chín)`,
      'i'
    );
    const codSpecialMatch: any = text.match(codSpecialPattern);
    if (codSpecialMatch) {
      const base = parseInt(codSpecialMatch[2]);
      const extraWord: any = codSpecialMatch[3];
      const specialMillionMap: Record<string, number> = {
        mốt: 0.1,
        rưỡi: 0.5,
        hai: 0.2,
        ba: 0.3,
        bốn: 0.4,
        năm: 0.5,
        sáu: 0.6,
        bảy: 0.7,
        tám: 0.8,
        chín: 0.9,
      };
      const extra = specialMillionMap[extraWord] || 0;
      const codValue = Math.round((base + extra) * 1_000_000);
      const codRaw = `${base} triệu ${extraWord}`;
      const cleanedCod = text.replace(codSpecialMatch[0], '').trim();
      return { codRaw, codValue, cleanedCod };
    }

    const codShortPattern = new RegExp(
      `(${codKeywords.join('|')})[^\\d]*(\\d+)\\s*tr(?:iệu)?\\s*(\\d{1,3})?`,
      'i'
    );

    const codShortMatch: any = text.match(codShortPattern);

    if (codShortMatch) {
      const baseMillion = parseInt(codShortMatch[2]);
      const thousandPart = codShortMatch[3] ? parseInt(codShortMatch[3]) : 0;

      const codValue =
        baseMillion * 1_000_000 +
        thousandPart * (thousandPart > 10 ? 10_000 : 100_000);
      const codRaw = `${baseMillion}tr${codShortMatch[3] || ''}`;

      const start = codShortMatch.index ?? text.indexOf(codShortMatch[0]);
      const end = start + codShortMatch[0].length;
      const cleanedCod = (text.slice(0, start) + text.slice(end)).trim();

      return { codRaw, codValue, cleanedCod };
    }

    for (const keyword of codKeywords) {
      const regex = new RegExp(
        `${keyword}\\s{0,5}(\\d+(?:[.,]\\d{3})*|\\d+)(\\s?(đ|vnđ|k|nghìn|ngàn|tr|triệu))\\b`,
        'i'
      );
      const match = text.match(regex);

      if (match) {
        const codRaw = match[1] + (match[2] || '');
        const codValue = normalizeMoneyString(codRaw);
        const cleanedCod = text.replace(match[0], '').trim();
        return {
          codRaw,
          codValue: codValue ? parseInt(codValue) : undefined,
          cleanedCod,
        };
      }
    }

    const valueKeywords = [
      'giá trị',
      'value',
      'giatri',
      'GT',
      'gt',
      'gtri',
      'tiền hàng',
      'tien hang',
    ];

    const codValueRegex =
      /\b(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(\s?(k|nghìn|ngàn|triệu|tr(?=\s|\.|,|$)|đ|vnđ))\b/gi;
    const matches = [...text.matchAll(codValueRegex)];

    if (matches.length === 1) {
      const match: any = matches[0];
      const codRaw = match[1] + (match[2] || '');
      const codValue = normalizeMoneyString(codRaw);

      const matchIndex = match.index ?? text.indexOf(match[0]);

      const isNearValueKeyword = valueKeywords.some((kw) => {
        const regex = new RegExp(`\\b${kw}\\b`, 'ig');
        const result = [...text.matchAll(regex)];
        return result.some((r) => {
          const dist = Math.abs((r.index ?? 0) - matchIndex);
          return dist < 20;
        });
      });

      if (isNearValueKeyword) {
        return { cleanedCod: text };
      }

      const keywordsPattern =
        '(thu hộ|thu|COD|tiền thu|tiền thu hộ|cần thu|khách trả|khách thanh toán|giá tiền|tổng tiền|thành tiền|th|COD:)';

      const fullRemoveRegex = new RegExp(
        `${keywordsPattern}\\s{0,10}${match[0]}`,
        'i'
      );

      let cleanedCod = text.replace(fullRemoveRegex, '').trim();
      if (cleanedCod === text.trim()) {
        cleanedCod = text.replace(match[0], '').trim();
      }

      return {
        codRaw,
        codValue: codValue ? parseInt(codValue) : undefined,
        cleanedCod,
      };
    }

    return { cleanedCod: text };
  }

  function extractValueWithNormalizedValue(text: string): {
    valueRaw?: string;
    valueValue?: number;
    cleanedValue: string;
  } {
    const valueKeywords = [
      'giá trị',
      'value',
      'giatri',
      'GT',
      'gt',
      'gtri',
      'tiền hàng',
      'tien hang',
    ];

    const specialMillionMap: Record<string, number> = {
      rưỡi: 0.5,
      mốt: 0.1,
      hai: 0.2,
      ba: 0.3,
      bốn: 0.4,
      năm: 0.5,
      sáu: 0.6,
      bảy: 0.7,
      tám: 0.8,
      chín: 0.9,
    };

    const codSpecialPattern = new RegExp(
      `(giá trị|value|giatri|GT|gt|gtri|tiền hàng|tien hang)\\s*(\\d+)\\s*triệu\\s*(rưỡi|mốt|hai|ba|bốn|năm|sáu|bảy|tám|chín)?`,
      'i'
    );
    const codSpecialMatch: any = text.match(codSpecialPattern);
    if (codSpecialMatch) {
      const base = parseInt(codSpecialMatch[2]);
      const extraWord = codSpecialMatch[3];
      const extra = extraWord
        ? specialMillionMap[extraWord.toLowerCase()] || 0
        : 0;
      const valueValue = Math.round((base + extra) * 1_000_000);
      const valueRaw = `${base} triệu${extraWord ? ' ' + extraWord : ''}`;
      const cleanedValue = text.replace(codSpecialMatch[0], '').trim();

      return {
        valueRaw,
        valueValue,
        cleanedValue,
      };
    }

    const codShortPattern = new RegExp(
      `(${valueKeywords.join('|')})[^\\d]*(\\d+)\\s*tr(?:iệu)?\\s*(\\d{1,3})?`,
      'i'
    );
    const codShortMatch: any = text.match(codShortPattern);
    if (codShortMatch) {
      const baseMillion = parseInt(codShortMatch[2]);
      const thousandPart = codShortMatch[3] ? parseInt(codShortMatch[3]) : 0;

      const valueValue =
        baseMillion * 1_000_000 +
        thousandPart * (thousandPart > 10 ? 10_000 : 100_000);
      const valueRaw = `${baseMillion}tr${codShortMatch[3] || ''}`;

      const start = codShortMatch.index ?? text.indexOf(codShortMatch[0]);
      const end = start + codShortMatch[0].length;
      const cleanedValue = (text.slice(0, start) + text.slice(end)).trim();

      return { valueRaw, valueValue, cleanedValue };
    }

    for (const keyword of valueKeywords) {
      const keywordRegex = new RegExp(
        `${keyword}[^\\d]*(\\d+(?:[.,]?\\d{0,3})?)\\s*(tr(?:iệu)?|tr|k|nghìn|ngàn|đ|vnđ)?`,
        'i'
      );
      const match = text.match(keywordRegex);
      if (match) {
        const numberPart = match[1];
        const unit = match[2]?.toLowerCase() || '';

        let valueRaw = numberPart;
        if (unit === 'k') {
          valueRaw += 'k';
        } else if (unit === 'nghìn' || unit === 'ngàn') {
          valueRaw += ' ' + unit;
        } else if (unit) {
          valueRaw += unit;
        }

        const valueValue = normalizeMoneyString(valueRaw);
        const cleanedValue = text.replace(match[0], '').trim();
        return {
          valueRaw,
          valueValue: valueValue ? parseInt(valueValue) : undefined,
          cleanedValue,
        };
      }
    }

    return { cleanedValue: text };
  }

  function extractWeight(text: string): {
    weightRaw?: string;
    weightValue?: string | null;
    cleanedWeight: string;
  } {
    const weightKeywords = [
      'khối lượng',
      'trọng lượng',
      'cân nặng',
      'KL',
      'kl',
      'nặng',
      'Khối lượng',
      'ký',
      'Ký',
      'Cân',
      'cân',
    ];

    for (const keyword of weightKeywords) {
      const regex = new RegExp(
        `\\b${keyword}[^\\d]*(\\d+(?:[.,]\\d+)?)(\\s?(kg|g|gram|gam|gr|ký|cân|lạng))?\\b`,
        'i'
      );

      const match = text.match(regex);
      if (match) {
        const weightRaw = match[1] + (match[2] || '');
        const weightValue = normalizeMoneyString(weightRaw);
        const cleanedWeight = text.replace(match[0], '').trim();
        return { weightRaw, weightValue, cleanedWeight };
      }
    }

    const regexUnitOnly =
      /(?:^|\s)(\d+(?:[.,]\d+)?)(\s?(kg|g|gram|gam|gr|ký|cân|lạng))\b/i;
    const matchUnit = text.match(regexUnitOnly);

    if (matchUnit) {
      const index = matchUnit.index ?? -1;
      const before = text.slice(Math.max(0, index - 4), index);
      const invalidPrefixes = ['P.', 'Q.', 'p.', 'q.', '/', '\\'];
      const isInvalid = invalidPrefixes.some((prefix) =>
        before.endsWith(prefix)
      );

      if (!isInvalid) {
        const weightRaw = matchUnit[1] + (matchUnit[2] || '');
        const weightValue = normalizeMoneyString(weightRaw);
        const cleanedWeight = text.replace(matchUnit[0], '').trim();
        return { weightRaw, weightValue, cleanedWeight };
      } else {
        const weightRaw = matchUnit[1] + (matchUnit[2] || '');
        const weightValue = normalizeMoneyString(weightRaw);
        const cleanedWeight = text.replace(matchUnit[0], '').trim();
        return { weightRaw, weightValue, cleanedWeight };
      }
    }

    return { cleanedWeight: text.trim() };
  }

  function extractNameFromText(
    cleanedTextName: any,
    result: any,
    resultValue: any
  ): { cleanedTextName: string; value: string | null } {
    const locationKeywords = [
      'số',
      'đường',
      'phường',
      'quận',
      'huyện',
      'thành phố',
      'tỉnh',
      'khu',
      'tòa',
      'lầu',
      'tầng',
      'căn',
      'chung cư',
      'kdc',
      'kcn',
      'q\\.',
      'p\\.',
      'tp\\.',
      'q[0-9]',
      'p[0-9]',
      'f[0-9]',
      '[0-9]+[a-zA-Z]?\\s*(?:đường|phố)', // pattern số nhà + đường
    ].join('|');

    let nameMatch =
      cleanedTextName.match(
        /(?:^|\s)(?:Ship|ship|Khách quen|khách quen|Tên:|tên:|người nhận|giao cho|ship cho|chuyển cho|cho|gửi cho|(?:cho|giao|gửi)?\s*(?:ông|bà|anh|chị|em|chú|cô|bác))(?=\s+)\s+(?!cái|chiếc|áo|váy|quần|đầm|bộ|giày|dép|áo dài|sản phẩm)([\p{L}\s]{2,30}?)(?!\s*(ở|tại|tới|đến)\b)(?=\s*(?:sản phẩm|sp|áo|quần|mã|địa chỉ|gửi|ship|sđt|đt|số|tại|[0-9]|,|\.|:|–|—|-|\n|$))/iu
      ) ||
      cleanedTextName.match(
        /(?:^|\s)(?:gửi tới|tên[:\s]*)([\p{L}\s]{2,30}?)(?=\s*[,:\.\n–—-]|$)/iu
      ) ||
      cleanedTextName.match(
        /(?:^|\s)(?:giao tới|ship tới|chuyển tới|gửi tới|Khách lấy|khách lấy)\s+((?:ông|bà|anh|chị|em|chú|cô|bác)\s+[\p{L}\s]{2,25}?)(?=\s*(?:–|—|-|,|\.|:|[0-9]|\n|$))(?!\s*(?:quận|huyện|phường|tp|tỉnh|thành phố|xã|ấp|đường|số|ngõ|hẻm))/iu
      ) ||
      cleanedTextName.match(
        /(?:^|\s)(?:ship tới|giao tới|chuyển tới|gửi tới)\s+((?:ông|bà|anh|chị|em|chú|cô|bác)\s+[\p{L}]{2,20})(?=\s*(?:,|\.|:|–|—|-|\n|$))/iu
      ) ||
      cleanedTextName.match(
        /(?:^|\s)(?:cho|gửi cho|giao cho|ship cho|Ship cho)\s+([\p{L}\s]{1,30}?)(?=\s*[,:\.\n–—-])/iu
      );

    let extractedName: string | null = null;

    if (nameMatch) {
      let possibleName = nameMatch[1].trim();
      possibleName = possibleName.replace(
        /\s+(nha|nhé|ạ|à|vậy|đó|này|tại|nè|ở)$/i,
        ''
      );

      possibleName = possibleName.replace(/\b(cho|với)\b/giu, '');

      const isNotAddress =
        !new RegExp(`^(?:${locationKeywords})`, 'i').test(possibleName) &&
        !possibleName.match(/^\d+[a-zA-Z]?\s/) &&
        !possibleName.match(/^(?:số|đường|phường|quận)/i);

      // if (!/^[a-z\s]+$/.test(possibleName) && isNotAddress) {
      //   extractedName = possibleName;
      //   result.name = extractedName;
      //   resultValue.name = extractedName;
      //   cleanedTextName = cleanedTextName.replace(nameMatch[0], '');
      // }

      const nameBlacklist = ['tới', 'đến', 'ở', 'tại'];

      if (
        nameBlacklist.includes(possibleName.toLowerCase()) ||
        /^[a-z\s]+$/.test(possibleName) || // toàn chữ thường — có thể là mô tả
        !isNotAddress
      ) {
        extractedName = null;
      } else {
        extractedName = possibleName;
        result.name = extractedName;
        resultValue.name = extractedName;
        cleanedTextName = cleanedTextName.replace(nameMatch[0], '');
      }
    } else {
      const fallbackName = cleanedTextName.match(/^([\p{L}\s]{2,20}),/u);
      if (fallbackName) {
        let possibleName = fallbackName[1].trim();

        possibleName = possibleName.replace(
          /\s+(nha|nhé|ạ|à|vậy|đó|này|tại|ở|nè)$/i,
          ''
        );

        const isNotAddress =
          !new RegExp(`^(?:${locationKeywords})`, 'i').test(possibleName) &&
          !possibleName.match(/^\d+[a-zA-Z]?\s/) &&
          !possibleName.match(/^(?:số|đường|phường|quận)/i);

        if (isNotAddress) {
          extractedName = possibleName;
          result.name = extractedName;
          resultValue.name = extractedName;
          cleanedTextName = cleanedTextName.replace(fallbackName[0], '');
        }
      }
    }

    return {
      cleanedTextName: cleanedTextName,
      value: extractedName,
    };
  }

  function extractInfoFromText(input: string) {
    const result = {
      name: '',
      phone: '',
      cod: '',
      value: '',
      weight: '',
      address: '',
      product: '',
    };

    const resultValue = {
      name: '',
      phone: '',
      cod: '',
      value: '',
      weight: '',
      address: '',
      product: '',
    };

    // const text = input.toLowerCase().replace(/\n/g, ' ');

    let cleanedText = input;

    const phoneResult = extractPhone(cleanedText);
    if (phoneResult.phone) {
      result.phone = phoneResult.phone;
      resultValue.phone = phoneResult.phone;
      cleanedText = phoneResult.cleanedText;
    }

    const { codRaw, codValue, cleanedCod } =
      extractCodWithNormalizedValue(cleanedText);
    if (codValue) {
      result.cod = codValue.toString();
      cleanedText = cleanedCod;
    }

    if (codRaw) {
      resultValue.cod = codRaw;
    }

    const { valueRaw, valueValue, cleanedValue } =
      extractValueWithNormalizedValue(cleanedText);

    if (valueValue) {
      result.value = valueValue.toString();
      cleanedText = cleanedValue;
    }

    if (valueRaw) {
      resultValue.value = valueRaw;
    }

    const { cleanedTextName, value } = extractNameFromText(
      cleanedText,
      result,
      resultValue
    );

    if (value) {
      result.name = value.toString();
      cleanedText = cleanedTextName;
    }

    const { productText, productValue, textWithoutProduct } =
      extractProductFromText(cleanedText);

    if (productText) {
      result.product = productText;
    }

    if (productValue) {
      resultValue.product = productValue;
    }

    if (textWithoutProduct) {
      cleanedText = textWithoutProduct;
    }

    const { weightRaw, weightValue, cleanedWeight } =
      extractWeight(cleanedText);

    if (weightValue) {
      result.weight = weightValue;
      cleanedText = cleanedWeight
        .replace(
          /(?:Nặng|Khối lượng:|kl|KL|Cân nặng|khối lượng|Khối lượng|nặng")/gi,
          ''
        )
        .trim();
    }

    if (weightRaw) {
      resultValue.weight = weightRaw;
    }

    const addressKeywords =
      /(địa chỉ:|địa chỉ|dc|Dia chi|DC|gửi về|giao đến|giao tại|tới|về|Giao gấp|Chuyển tới|Gửi tới địa chỉ|gửi|tại|ở|đến|Giao hàng|đơn|Đơn|em|Em|Gửi|gửi|cho|Cho|ship|Ship|hàng này|Hàng này|cũ|Cũ)/gi;

    const keywordMatch = cleanedText.match(addressKeywords);
    if (keywordMatch) {
      const lastKeyword: any = keywordMatch[keywordMatch.length - 1];
      const keywordIndex = cleanedText
        .toLowerCase()
        .lastIndexOf(lastKeyword.toLowerCase());

      cleanedText = cleanedText
        .slice(keywordIndex + lastKeyword.length)
        .replace(/^[:.,\s]+/, '')
        .trim();
    }

    const addressMatch: any =
      cleanedText.match(
        /(\d{1,4}[\/\d\s\w,.\\\-]*?(quận|Q\.?|phường|P\.?|tp\.?|thành phố|hcm|hà nội|huế|cần thơ|sài gòn)[\p{L}\d\s,./\-]*)/giu
      ) || cleanedText.match(/(\d{1,4}[\/\d\s\p{L},\-\.]{3,})/u);

    if (addressMatch) {
      const valueAdd = cleanedText
        .replace(addressKeywords, '')
        .replace(
          /\.*\s*không thu hộ|Không thu tiền|Không thu hộ|không thu tiền|không lấy tiền|Không lấy tiền\s*\.?$/i,
          ''
        )
        .replace(/\s*(với nha|nha|nhé|ạ|à)$/i, '')
        .replace(/^[,.\s]+|[,.\s]+$/g, '')
        .replace(/^[:.,\s]+/, '')
        .replace(/^[–—\-_~`!@#$%^&*()+=\[\]{}|\\:";'<>?,.\/\s]+/, '')
        .replace(/^[–—\-]{1,}\s*[–—\-]{1,}\s*/, '')
        .replace(/^[–—\-]\s*[–—\-]\s*/, '')
        .trim();

      result.address = valueAdd;
      resultValue.address = valueAdd;
      cleanedText = cleanedText.replace(addressMatch[1], '');
    } else {
      const fallbackAddr = cleanedText.match(/\d{1,4}[\/\d\s\w,.\\\-]+/u);
      if (fallbackAddr) {
        const valueAdd = fallbackAddr[0]
          .replace(addressKeywords, '')
          .trim()
          .replace(
            /\.*\s*không thu hộ|Không thu tiền|Không thu hộ|không thu tiền|không lấy tiền|Không lấy tiền\s*\.?$/i,
            ''
          )
          .replace(/^[,.\s]+|[,.\s]+$/g, '')
          .replace(/^[:.,\s]+/, '');
        result.address = valueAdd;
        resultValue.address = valueAdd;
      }
    }

    // if (type === undefined) {
    //   handleContinueCreate(result);
    // }

    // setValueRegex(resultValue);
    // setInputValue(input);

    return {
      result: result,
      resultOld: resultValue,
    };
  }

  return extractInfoFromText(input);
}
