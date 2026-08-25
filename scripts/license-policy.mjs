const ALLOWED = new Set(['CC0-1.0', 'MIT', 'BSD-2-Clause']);
const DENIED = new Set([
  'CC-BY',
  'CC-BY-SA',
  'CC-BY-NC',
  'Apache-2.0',
  'BSD-3-Clause',
  'OFL-1.1',
  'GPL',
  'Zlib',
]);

export const ALLOWED_LICENSES = Object.freeze([...ALLOWED]);

/** Packs safe for schema-v1 consumers, which strip notices and assume CC0. */
export function legacyCompatiblePacks(packs) {
  return packs.filter((pack) => pack.license === 'CC0-1.0');
}

function normalized(text) {
  return text.toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ');
}

function normalizedWords(text) {
  return normalized(text).replace(/[^a-z0-9]+/g, ' ').trim();
}

function hasCopyrightNotice(text) {
  const notices = text.matchAll(/^\s*copyright\s*(?:\(c\)|©)?\s+\d{4}(?:\s*[-–,]\s*\d{4})?\s+(.+?)\s*$/gim);
  const placeholder = /(?:<[^>]*>|\[[^\]]*\]|\b(?:copyright holder|author name|your name|name here|todo|tbd|unknown)\b)/i;
  return [...notices].some((match) => match[1].trim().length >= 2 && !placeholder.test(match[1]));
}

/** Every SPDX id recognisable in the licence body. */
export function licensesFromText(text) {
  const t = normalized(text);
  const found = new Set();
  if (/creativecommons\.org\/licenses\/by-nc/.test(t)) found.add('CC-BY-NC');
  else if (/creativecommons\.org\/licenses\/by-sa/.test(t)) found.add('CC-BY-SA');
  else if (/creativecommons\.org\/licenses\/by/.test(t)) found.add('CC-BY');
  if (
    /creativecommons\.org\/publicdomain\/zero/.test(t) ||
    /creative commons zero/.test(t) ||
    /\bcc0\s+1\.0\b/.test(t) ||
    /public domain dedication/.test(t)
  ) found.add('CC0-1.0');
  if (/redistributions of source code must retain/.test(t)) {
    found.add(/neither the name/.test(t) ? 'BSD-3-Clause' : 'BSD-2-Clause');
  }
  if (/altered source versions must be plainly marked/.test(t)) found.add('Zlib');
  if (/permission is hereby granted, free of charge/.test(t)) found.add('MIT');
  if (/apache license/.test(t)) found.add('Apache-2.0');
  if (/sil open font license/.test(t)) found.add('OFL-1.1');
  if (/gnu general public license/.test(t)) found.add('GPL');
  return [...found];
}

function validateMit(text) {
  const t = normalizedWords(text);
  if (!hasCopyrightNotice(text)) {
    return 'MIT text must carry a real `Copyright <year> <holder>` notice';
  }
  const required = [
    ['permission grant', `permission is hereby granted free of charge to any person obtaining a copy
      of this software and associated documentation files the software to deal in the software
      without restriction including without limitation the rights to use copy modify merge publish
      distribute sublicense and or sell copies of the software and to permit persons to whom the
      software is furnished to do so subject to the following conditions`],
    ['notice condition', `the above copyright notice and this permission notice shall be included
      in all copies or substantial portions of the software`],
    ['warranty disclaimer', `the software is provided as is without warranty of any kind express or
      implied including but not limited to the warranties of merchantability fitness for a particular
      purpose and noninfringement`],
    ['liability disclaimer', `in no event shall the authors or copyright holders be liable for any
      claim damages or other liability whether in an action of contract tort or otherwise arising
      from out of or in connection with the software or the use or other dealings in the software`],
  ];
  const missing = required.find(([, phrase]) => !t.includes(normalizedWords(phrase)));
  return missing ? `MIT text is incomplete: missing its ${missing[0]}` : null;
}

function validateBsd2(text) {
  const t = normalizedWords(text);
  if (!hasCopyrightNotice(text)) {
    return 'BSD-2-Clause text must carry a real `Copyright <year> <holder>` notice';
  }
  const required = [
    ['redistribution grant', `redistribution and use in source and binary forms with or without
      modification are permitted provided that the following conditions are met`],
    ['source notice condition', `redistributions of source code must retain the above copyright
      notice this list of conditions and the following disclaimer`],
    ['binary notice condition', `redistributions in binary form must reproduce the above copyright
      notice this list of conditions and the following disclaimer in the documentation and or other
      materials provided with the distribution`],
    ['warranty disclaimer', `this software is provided by the copyright holders and contributors as
      is and any express or implied warranties including but not limited to the implied warranties
      of merchantability and fitness for a particular purpose are disclaimed`],
    ['liability disclaimer', `in no event shall the copyright holder or contributors be liable for
      any direct indirect incidental special exemplary or consequential damages including but not
      limited to procurement of substitute goods or services loss of use data or profits or business
      interruption however caused and on any theory of liability whether in contract strict liability
      or tort including negligence or otherwise arising in any way out of the use of this software
      even if advised of the possibility of such damage`],
  ];
  const missing = required.find(([, phrase]) => !t.includes(normalizedWords(phrase)));
  return missing ? `BSD-2-Clause text is incomplete: missing its ${missing[0]}` : null;
}

function validateCc0(text) {
  const t = normalized(text);
  const officialReference = /creativecommons\.org\/publicdomain\/zero\/1\.0/.test(t) ||
    (/cc0\s+1\.0\s+universal/.test(t) && /public domain dedication/.test(t));
  if (!officialReference) return 'CC0 text must identify the Creative Commons Zero 1.0 dedication';
  const provenance = (
    /^\s*source:\s*https?:\/\//im.test(text) && /^\s*verified-by:\s*\S/im.test(text)
  ) || /created\/distributed by|artwork by/.test(t);
  const effect = [
    /dedicated to the public domain/,
    /waived all copyright and related or neighboring rights/,
    /waives[\s\S]*copyright and related rights/,
    /(?:free to use|use this content|copy modify distribute)[\s\S]*(?:commercial|personal|educational)/,
    /use (?:it|this art)[\s\S]*(?:commercial|personal|educational)/,
    /(?:crediting|credit)[\s\S]*(?:not mandatory|not a requirement)/,
    /no attribution (?:is )?required/,
    /assets fall under the cc0 1\.0/,
    /all without asking permission/,
  ];
  return provenance || effect.some((pattern) => pattern.test(t))
    ? null
    : 'CC0 text is incomplete: add creator provenance or the dedication reuse effect';
}

/**
 * Classify and validate one licence document. An SPDX header may corroborate the
 * body, but the body alone must prove the licence and carry every required notice.
 */
export function inspectLicenseText(text) {
  const declarations = [...text.matchAll(/^\s*SPDX-License-Identifier:\s*(.+?)\s*$/gim)]
    .map((match) => match[1].trim());
  if (declarations.length > 1) {
    return { error: 'licence text carries multiple SPDX-License-Identifier declarations; exactly one is permitted' };
  }
  const declared = declarations[0] ?? null;
  if (declared && !/^[A-Za-z0-9.+-]+$/.test(declared)) {
    return { error: `SPDX-License-Identifier must name one licence, not a compound expression: ${declared}` };
  }
  const detectedLicenses = licensesFromText(text);

  if (detectedLicenses.length === 0) {
    return {
      error: declared
        ? `declares SPDX-License-Identifier: ${declared}, but its body does not contain recognisable licence terms`
        : 'licence text matches nothing we recognise',
    };
  }
  if (detectedLicenses.length > 1) {
    return { error: `licence text mixes multiple recognised licences: ${detectedLicenses.join(', ')}. Split the pack by licence` };
  }
  const [detected] = detectedLicenses;
  if (declared && declared !== detected) {
    return { error: `declares SPDX-License-Identifier: ${declared} but its text reads as ${detected}. Fix whichever is wrong` };
  }
  if (!ALLOWED.has(detected)) {
    const why = DENIED.has(detected)
      ? `${detected} is not permitted in this library`
      : `${detected} is not on the allow list`;
    return { error: `${why}. Allowed: ${ALLOWED_LICENSES.join(', ')}` };
  }

  const noticeError = detected === 'MIT'
    ? validateMit(text)
    : detected === 'BSD-2-Clause'
      ? validateBsd2(text)
      : validateCc0(text);
  return noticeError ? { error: noticeError } : { license: detected };
}
