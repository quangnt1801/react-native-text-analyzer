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

  if (isExcludedPhrase(trimmedText)) {
    return false;
  }

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
];

const productUnitRegex = new RegExp(
  String.raw`(\d+\s*(${productUnits.join(
    '|'
  )})\s+[a-zA-ZÀ-ỹ\s]+?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

const productUnitWithoutNumberRegex = new RegExp(
  String.raw`\b((?:${productUnits.join(
    '|'
  )})\s+[a-zA-ZÀ-ỹ\s]{2,50}?)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

// const locationNames = [
//   'Bình Thạnh',
//   'Tân Bình',
//   'Quận 1',
//   'Quận 2',
//   'Quận 3',
//   'Quận 4',
//   'Quận 5',
//   'Quận 6',
//   'Quận 7',
//   'Quận 8',
//   'Quận 9',
//   'Quận 10',
//   'Quận 11',
//   'Quận 12',
//   'Thủ Đức',
//   'Gò Vấp',
//   'Phú Nhuận',
//   'Bình Tân',
//   'Tân Phú',
//   'Hóc Môn',
//   'Củ Chi',
//   'Cần Giờ',
//   'Nhà Bè',
//   'Bình Chánh',
//   'Hà Nội',
//   'Hồ Chí Minh',
//   'Đà Nẵng',
//   'Hải Phòng',
//   'Cần Thơ',
//   'Đồng Nai',
//   'Bình Dương',
//   'Long An',
//   'Tây Ninh',
//   'An Giang',
//   'Ba Ria',
//   'Vũng Tàu',
//   'Khánh Hòa',
//   'Lâm Đồng',
//   'Ninh Thuận',
// ].join('|');

// function isLocationName(text: string): boolean {
//   const normalizedText = text.trim();
//   const locationRegex = new RegExp(`^(?:${locationNames})$`, 'i');
//   return locationRegex.test(normalizedText);
// }

// const addressKeywords =
//   /(địa chỉ:|địa chỉ|dc|Dia chi|DC|gửi về|giao đến|giao tại|tới|về|Giao gấp|Chuyển tới|Gửi tới địa chỉ|gửi|tại|ở|đến|Giao hàng|đơn|Đơn|em|Em|Gửi|gửi|cho|Cho|ship|Ship|hàng này|Hàng này|cũ|Cũ)/gi;

// function isInAddressContext(
//   fullText: string,
//   matchStart: number,
//   matchEnd: number
// ): boolean {
//   const contextBefore = fullText.substring(
//     Math.max(0, matchStart - 50),
//     matchStart
//   );
//   const contextAfter = fullText.substring(
//     matchEnd,
//     Math.min(fullText.length, matchEnd + 50)
//   );

//   const addressRegex = new RegExp(`(?:${addressKeywords})`, 'i');
//   const hasAddressKeywordBefore = addressRegex.test(contextBefore);
//   const hasAddressKeywordAfter = addressRegex.test(contextAfter);

//   const addressPatternBefore =
//     /(?:\d+[a-zA-Z]?\s+\w+|P\.\d+|Q\.\w+|F\.\d+)/i.test(contextBefore);
//   const addressPatternAfter = /(?:P\.\d+|Q\.\w+|F\.\d+)/i.test(contextAfter);

//   return (
//     hasAddressKeywordBefore ||
//     hasAddressKeywordAfter ||
//     addressPatternBefore ||
//     addressPatternAfter
//   );
// }

// const productEndOfSentenceRegex = new RegExp(
//   String.raw`\.\s*([A-ZÀ-Ỹ][a-zA-ZÀ-ỹ]{2,50}(?:\s[A-ZÀ-Ỹ][a-zA-ZÀ-ỹ]{2,50})?)(?=\s*(?:với nha|nha|nhé|ạ|$))`,
//   'iu'
// );

// function extractProductEndOfSentence(text: string): string {
//   const match: any = productEndOfSentenceRegex.exec(text);

//   if (match) {
//     const potentialProduct = match[1].trim();
//     const matchStart = match.index || 0;
//     const matchEnd = matchStart + match[0].length;

//     const isValid =
//       !isLocationName(potentialProduct) &&
//       !isInAddressContext(text, matchStart, matchEnd) &&
//       !potentialProduct.match(
//         /^(?:Không|Trong|Ngoài|Cùng|Giống|Khác|Này|Đó|Kia|Thế|Như|Vậy|Được|Cho|Của|Với|Từ|Tới|Về|Theo|Qua|Trên|Dưới|Sau|Trước)$/i
//       ) &&
//       potentialProduct.length >= 3 &&
//       potentialProduct.length <= 50;

//     return isValid ? potentialProduct : '';
//   }

//   return '';
// }

const productAfterPeriodRegex = new RegExp(
  String.raw`\.\s*([A-ZÀ-Ỹ][a-zA-ZÀ-ỹ\s]*(?:${productUnits.join(
    '|'
  )})[a-zA-ZÀ-ỹ\s]*)(?=\s*(?:${commonFieldKeywords}|,|\.|$))`,
  'iu'
);

export function extractProductFromText(cleanedText: string): {
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

  let productMatch: any = cleanedText.match(productRegexPrimary);
  if (!productMatch) productMatch = cleanedText.match(productRegexFallback);
  if (!productMatch) productMatch = cleanedText.match(productUnitRegex);

  if (!productMatch)
    productMatch = cleanedText.match(productUnitWithoutNumberRegex);

  // if (!productMatch)
  //   // productMatch = cleanedText.match(productEndOfSentenceRegex);
  //   productMatch = extractProductEndOfSentence(cleanedText);

  // let extractedProduct = '';
  // if (productMatch) {
  //   extractedProduct = productMatch[1]?.trim?.() ?? '';
  // } else {
  //   extractedProduct = extractProductEndOfSentence(cleanedText); // Trả về string trực tiếp
  // }

  if (!productMatch) productMatch = cleanedText.match(productAfterPeriodRegex);

  if (!productMatch) {
    const weightMatch: any = cleanedText.match(productAfterWeightRegex);

    if (weightMatch) {
      const productName = weightMatch[2].trim();

      const keywordLikeInfo = new RegExp(
        `\\b(${commonFieldKeywords})\\b`,
        'iu'
      );
      if (isValidProduct(productName) && !keywordLikeInfo.test(productName)) {
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
      const productName = weightMatch[2].trim();

      if (isValidProduct(productName)) {
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
    value = value.replace(/\s*(với nha|nha|nhé|ạ|à)$/i, '');

    if (isValidProduct(value)) {
      productText = value.replace(
        /\.*\s*không thu hộ|Không thu tiền|Không thu hộ|không thu tiền|không lấy tiền|Không lấy tiền\s*\.?$/i,
        ''
      );
      productValue = value.replace(
        /\.*\s*không thu hộ|Không thu tiền|Không thu hộ|không thu tiền|không lấy tiền|Không lấy tiền\s*\.?$/i,
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
