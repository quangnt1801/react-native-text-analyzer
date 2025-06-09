const commonFieldKeywords = [
  'về',
  'cho',
  'tới',
  'địa chỉ',
  'gửi về',
  'đến',
  'giao tại',
  'ship về',
  'người nhận',
  'số điện thoại',
  'thu hộ',
  'khối lượng',
  'mã đơn',
  'mã vận đơn',
  'với nha',
  'nha',
  'nhé',
  'ạ',
  'ship tới',
].join('|');

const excludedPhrases = [
  'đơn hàng này',
  'đơn hàng đó',
  'đơn này',
  'đơn đó',
  'đơn hàng',
  'kiện hàng này',
  'kiện hàng đó',
  'kiện này',
  'kiện đó',
  'package này',
  'package đó',
  'hàng này',
  'hàng đó',
  'món này',
  'món đó',
  'cái này',
  'cái đó',
  'thứ này',
  'thứ đó',
];

const weightUnits = [
  'kg',
  'kilogram',
  'g',
  'gram',
  'l',
  'lit',
  'lít',
  'tấn',
  'yến',
  'lạng',
  'ký',
  'kilo',
  'gam',
  'cân',
];

function isWeightInfo(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();

  const weightPattern = new RegExp(
    `^\\d+(?:\\.\\d+)?\\s*(${weightUnits.join('|')})$`,
    'i'
  );

  return weightPattern.test(normalizedText);
}

function isExcludedPhrase(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  return excludedPhrases.some(
    (phrase) =>
      normalizedText === phrase.toLowerCase() ||
      normalizedText.includes(phrase.toLowerCase())
  );
}

function isValidProduct(text: string): boolean {
  const trimmedText = text.trim();

  if (isWeightInfo(trimmedText)) {
    return false;
  }

  // if (isExcludedPhrase(trimmedText)) {
  //   return false;
  // }

  if (isExcludedPhrase(trimmedText) && trimmedText.split(' ').length <= 2) {
    return false;
  }

  // if (nameNegativePatterns.some((pattern) => pattern.test(trimmedText))) {
  //   return false;
  // }

  const genericWords = ['này', 'đó', 'đây', 'kia', 'đơn', 'hàng', 'kiện'];
  const words = trimmedText.toLowerCase().split(/\s+/);
  const hasSpecificProduct = words.some(
    (word) =>
      !genericWords.includes(word) &&
      word.length > 2 &&
      !/^(cho|của|với|từ|tới|về)$/.test(word)
  );

  return hasSpecificProduct;
}

const productRegexPrimary = new RegExp(
  String.raw`(?:sp|tên sản phẩm|sản phẩm)\s+([^\d,\.]{2,100}?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

const productRegexFallback = new RegExp(
  String.raw`(?:gửi|ship|Khách lấy|khách lấy)\s*(?:\d+|một|vài|mấy)?\s+([^\d,\.]{2,100}?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

const productRegexChuyen = new RegExp(
  String.raw`(?:chuyển)\s*(?:\d+|một|vài|mấy)?\s+([^\d,\.]{2,100}?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

const productWithSizeRegex = new RegExp(
  String.raw`(\b[^\d,\.]{2,100}?\s*size\s*\d+)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

const productAfterWeightRegex = new RegExp(
  String.raw`\b\d+(?:\.\d+)?\s*(${weightUnits.join(
    '|'
  )})\s+([a-zA-ZÀ-ỹ\s]{2,50}?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

const productUnits = [
  'thùng',
  'hộp',
  'chai',
  'bịch',
  'cây',
  'cục',
  'lọ',
  'gói',
  'bó',
  'túi',
  'thẻ',
  'vỉ',
  'kiện',
  'xấp',
  'đôi',
  'cái',
  'chiếc',
  'quả',
  'hạt',
  'Hộp',
  'trái',
  'quần',
  'áo',
  'khăn',
  'thúng',
];

const productUnitRegex = new RegExp(
  String.raw`(\d+\s*(${productUnits.join(
    '|'
  )})\s+[a-zA-ZÀ-ỹ\s]+?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

// const productUnitWithoutNumberRegex = new RegExp(
//   String.raw`\b((?:${productUnits.join(
//     '|'
//   )})\s+[a-zA-ZÀ-ỹ\s]{2,50}?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
//   'iu'
// );

const productUnitWithoutNumberRegex = new RegExp(
  String.raw`\b((?:${productUnits.join('|')})\s+[a-zA-ZÀ-ỹ\s]{2,50}?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

const productAfterPeriodRegex = new RegExp(
  String.raw`\.\s*([A-ZÀ-Ỹ][a-zA-ZÀ-ỹ\s]*(?:${productUnits.join(
    '|'
  )})[a-zA-ZÀ-ỹ\s]*)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

function isInvalidProductPhrase(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  const patterns = [
    /^nha\s+\w+$/, // "nha a", "nha anh", "nha bạn"
    /^\w+\s+nha$/, // "a nha", "anh nha"
    /^nha$/, // "nha"
    /^ạ$/, // chỉ "ạ"
    /^[a-z]{1,3}$/, // các từ rất ngắn, thường là không hợp lý cho tên sản phẩm
  ];

  return patterns.some((regex) => regex.test(normalized));
}

const naturalPhrases = [
  'nhe',
  'nhé',
  'ạ',
  'à',
  'với nha',
  'nha',
  'nhe a',
  'nhé a',
  'nhe anh',
  'nhé anh',
  'nhanh',
  'lâu',
  'chậm',
  'luôn',
  'luôn nha',
  'đó',
];

function isNaturalPhrase(text: string): boolean {
  const normalized = text.toLowerCase().trim();
  return naturalPhrases.includes(normalized);
}

export function extractProductFromTextAdvanced(cleanedText: string): {
  productText: string;
  productValue: string;
  textWithoutProduct: string;
} {
  let productText = '';
  let productValue = '';
  let textWithoutProduct = cleanedText;

  cleanedText = cleanedText.replace(
    /\b(giúp em|nhờ|làm ơn|xin|vui lòng)\b/giu,
    ''
  );

  let productMatch: any = cleanedText.match(productUnitRegex);
  if (!productMatch)
    productMatch = cleanedText.match(productUnitWithoutNumberRegex);
  if (!productMatch) productMatch = cleanedText.match(productRegexPrimary);
  if (!productMatch) productMatch = cleanedText.match(productRegexFallback);

  if (!productMatch)
    productMatch = cleanedText.match(productUnitWithoutNumberRegex);

  if (!productMatch) productMatch = cleanedText.match(productAfterPeriodRegex);

  if (!productMatch) {
    const weightMatch: any = cleanedText.match(productAfterWeightRegex);

    if (weightMatch) {
      const productName = weightMatch[2].trim();

      const keywordLikeInfo = new RegExp(
        `\\b(${commonFieldKeywords})\\b`,
        'iu'
      );
      if (
        isValidProduct(productName) &&
        !keywordLikeInfo.test(productName) &&
        !isNaturalPhrase(productName)
      ) {
        productText = productName;
        productValue = productName;

        const fullMatch = weightMatch[0];
        const weightInfo = fullMatch.replace(productName, '').trim();
        textWithoutProduct = cleanedText.replace(fullMatch, weightInfo);
      }
    }
  }

  if (!productMatch) productMatch = cleanedText.match(productRegexChuyen);

  if (!productMatch) productMatch = cleanedText.match(productWithSizeRegex);

  if (!productMatch) {
    const weightMatch: any = cleanedText.match(productAfterWeightRegex);
    if (weightMatch) {
      let productName = weightMatch[2].trim();
      productName = productName.replace(/\s*(với nha|nha|nhé|ạ|à)$/i, '');

      if (isValidProduct(productName) && !isInvalidProductPhrase(productName)) {
        productText = productName;
        productValue = productName;

        const fullMatch = weightMatch[0];
        const weightInfo = fullMatch.replace(productName, '').trim();
        textWithoutProduct = cleanedText.replace(fullMatch, weightInfo);
      }
    }
  }

  if (!productMatch) {
    const otherMatch: any = cleanedText.match(productAfterWeightRegex);
    if (otherMatch && otherMatch !== productMatch) {
      let value = otherMatch[1] ? otherMatch[1].trim() : otherMatch[2].trim();
      value = value.replace(/\s*(với nha|nha|nhé|ạ|à)$/i, '');

      if (isValidProduct(value)) {
        productText = value;
        productValue = value;
        textWithoutProduct = cleanedText.replace(otherMatch[0], '');
      }
    }
  }

  if (productMatch) {
    let value = productMatch[1].trim();
    value = value.replace(/\s*(với nha|nha|nhé|ạ|à|ship)$/i, '');

    if (isValidProduct(value)) {
      productText = value.replace(
        /\.*\s*không thu hộ|Không thu tiền|Không thu hộ|không thu tiền|không lấy tiền|Không lấy tiền|giúp đơn\s*\.?$/i,
        ''
      );
      productValue = value.replace(
        /\.*\s*không thu hộ|Không thu tiền|Không thu hộ|không thu tiền|không lấy tiền|Không lấy tiền|giúp đơn\s*\.?$/i,
        ''
      );
      textWithoutProduct = cleanedText.replace(productMatch[0], '');
    }
  }

  return {
    productText,
    productValue,
    textWithoutProduct,
  };
}
