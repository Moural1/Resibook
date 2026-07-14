import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { ACLS_NAVIGATION } from "../src/lib/acls-navigation.ts";
import { ACLS_PROTOCOLS } from "../src/lib/acls-protocols.ts";

const SOURCE_HASHES = {
  "5hs-e-5ts": "552682d82343c0f62ca249793b63343faea93f6ed65bc5e2fe6dbcc5f86ffbca",
  "avaliacao-inicial-sbv": "a8b0faf8947a652c7172ef13719d5ad37489eeb33f0a040e547d44f575a9b2b7",
  "avaliacao-primaria-abcde": "377708f2c945f004952b9327826a2ed44e0f851f77231be1365e1f12e007cb38",
  "avaliacao-secundaria-sample": "5c3a933b20c337b57cfeee36fb2bfd1a0d6963f8517d7e5294bbde8d0d932e80",
  "cadeia-de-sobrevivencia": "69eab95ced3a41b93291c9e98a0298a31679e2bd0e1d0b33ba9a60fca7088621",
  "rcp-de-alta-qualidade": "0315ac22c0e2bcfbea8240e335c78f510a1c530a49cb1f0bb3c6685739cb9f00",
};

function sourceHash(source) {
  return createHash("sha256")
    .update(source.replace(/\r\n/g, "\n").trim(), "utf8")
    .digest("hex");
}

test("conteúdo médico ACLS permanece idêntico aos arquivos editoriais", () => {
  assert.equal(ACLS_PROTOCOLS.length, Object.keys(SOURCE_HASHES).length);

  for (const protocol of ACLS_PROTOCOLS) {
    assert.equal(
      sourceHash(protocol.source),
      SOURCE_HASHES[protocol.slug],
      `O conteúdo de ${protocol.title} foi alterado.`
    );
  }
});

test("sidebar libera somente protocolos ACLS com conteúdo fornecido", () => {
  const availableSlugs = ACLS_NAVIGATION
    .filter((item) => item.available)
    .map((item) => item.slug)
    .sort();
  const protocolSlugs = ACLS_PROTOCOLS.map((protocol) => protocol.slug).sort();

  assert.deepEqual(availableSlugs, protocolSlugs);
});
