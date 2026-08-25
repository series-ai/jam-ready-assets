import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectLicenseText, legacyCompatiblePacks } from './license-policy.mjs';

const MIT = `
Copyright (c) 2026 Example Artist

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const BSD_2 = `
Copyright (c) 2026 Example Artist
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`;

test('accepts complete MIT text with or without an SPDX declaration', () => {
  assert.deepEqual(inspectLicenseText(MIT), { license: 'MIT' });
  assert.deepEqual(inspectLicenseText(`SPDX-License-Identifier: MIT\n${MIT}`), { license: 'MIT' });
});

test('rejects an SPDX-only or unrecognisable MIT document', () => {
  assert.match(inspectLicenseText('SPDX-License-Identifier: MIT').error, /body does not contain/);
  assert.match(inspectLicenseText('SPDX-License-Identifier: MIT\nhello').error, /body does not contain/);
});

test('rejects truncated MIT text and a placeholder copyright notice', () => {
  assert.match(
    inspectLicenseText('Copyright (c) 2026 Example Artist\nPermission is hereby granted, free of charge.').error,
    /incomplete/,
  );
  for (const holder of ['<COPYRIGHT HOLDER>', '[copyright holder]', 'TBD']) {
    assert.match(inspectLicenseText(MIT.replace('Example Artist', holder)).error, /real/);
  }
  assert.match(
    inspectLicenseText(MIT.replace(/ for any claim[\s\S]+/i, ' for any claim.')).error,
    /incomplete/,
  );
});

test('rejects an SPDX declaration that disagrees with the body', () => {
  assert.match(inspectLicenseText(`SPDX-License-Identifier: BSD-2-Clause\n${MIT}`).error, /reads as MIT/);
});

test('rejects multiple or compound SPDX declarations', () => {
  assert.match(
    inspectLicenseText(`SPDX-License-Identifier: MIT\nSPDX-License-Identifier: GPL-3.0-only\n${MIT}`).error,
    /multiple SPDX/,
  );
  assert.match(
    inspectLicenseText(`SPDX-License-Identifier: MIT OR GPL-3.0-only\n${MIT}`).error,
    /compound expression/,
  );
});

test('accepts complete BSD-2-Clause text', () => {
  assert.deepEqual(inspectLicenseText(`SPDX-License-Identifier: BSD-2-Clause\n${BSD_2}`), {
    license: 'BSD-2-Clause',
  });
});

test('rejects BSD-2-Clause text with a truncated disclaimer tail', () => {
  assert.match(
    inspectLicenseText(BSD_2.replace(/ \(INCLUDING, BUT NOT LIMITED TO,[\s\S]+/i, '.')).error,
    /incomplete/,
  );
});

test('rejects BSD-3-Clause and Zlib because carrying a file is not their only restriction', () => {
  assert.match(inspectLicenseText(`${BSD_2}\nNeither the name of the copyright holder may be used to endorse products.`).error, /BSD-3-Clause is not permitted/);
  assert.match(inspectLicenseText('Altered source versions must be plainly marked as such.').error, /Zlib is not permitted/);
});

test('rejects the Unlicense as policy rather than as unrecognised text', () => {
  const unlicense = 'This is free and unencumbered software released into the public domain.\n'
    + 'For more information, please refer to <https://unlicense.org>';
  assert.match(inspectLicenseText(unlicense).error, /Unlicense is not permitted/);
});

test('rejects an allowed licence body mixed with a denied licence', () => {
  for (const denied of [
    'GNU General Public License version 3',
    'Apache License Version 2.0',
    'SIL Open Font License 1.1',
  ]) {
    assert.match(inspectLicenseText(`${MIT}\n${denied}`).error, /mixes multiple recognised licences/);
  }
});

test('accepts a CC0 provenance document', () => {
  assert.deepEqual(
    inspectLicenseText(`SPDX-License-Identifier: CC0-1.0
Source: https://example.com/pack
This work is dedicated to the public domain under the Creative Commons Zero 1.0 dedication.
Full text: https://creativecommons.org/publicdomain/zero/1.0/legalcode`),
    { license: 'CC0-1.0' },
  );
});

test('rejects fragmentary CC0 declarations', () => {
  for (const text of [
    'Creative Commons Zero',
    'CC0 1.0',
    'public domain dedication',
    'SPDX-License-Identifier: CC0-1.0\nhttps://creativecommons.org/publicdomain/zero/1.0/',
  ]) {
    assert.match(inspectLicenseText(text).error, /CC0 text|recognisable/);
  }
});

test('keeps MIT and BSD-2-Clause packs out of the legacy CC0-only catalog', () => {
  const packs = [
    { id: 'cc0', license: 'CC0-1.0' },
    { id: 'mit', license: 'MIT' },
    { id: 'bsd', license: 'BSD-2-Clause' },
  ];
  assert.deepEqual(legacyCompatiblePacks(packs), [packs[0]]);
});
