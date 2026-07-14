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
  "bradicardia": "c99ff8e2d79f4fc252ed137c5c23e22dcb7c070603b6eafe20985a4f26d556d1",
  "pcr-ritmo-chocavel": "6433298bc6ca8cf56481a8b1316560be034bd21b1d894af56c8b276fbc80987c",
  "pcr-ritmo-nao-chocavel": "3a35fd34e4e9c1b5fe4c153e989e4719ec9764489ca9d831c50f3d864e282805",
  "taquicardia": "5bd5478f3d438e0c0a6b53065b6520d8e02adad4b09c5184ff26a9b1efc14b52",
  "drogas-acls": "bb8052261831e74aae36a568795aaa5ea7b07ddb0788a92d406925b49c9a6b34",
  "ritmos-cardiacos": "23988e9d83a79fbaadd83d707afae2d81f09a868879cf02460c21e1854987f1b",
  "cardioversao-vs-desfibrilacao": "81b20eb72adde46a4e5aaa3b7e16f413e4b17f9278843e811171af69475d78f7",
  "iam": "ce71387d62528e8ba075d2b411aff2ba3cd7c83009cec205244ade9c3939027d",
  "iam-com-supra": "380010d689b1cbbf581142e506ab9442e24653441dac94242d9396146e2a8599",
  "estrategias-reperfusao-iamcsst": "c684f3e35ba779eb28445667da5c4e8d714d5e308bb0f2889af47079c8a0904b",
  "trombolise-iam-com-supra": "86b38064344590ccea2bcc3f0dec611903be33d8e7ec270d048c29d9005c0596",
  "icp-resgate": "14c184506928ebd09c7fb3378c823f00bbc0c841739bada1e8c48e65bf9b328b",
  "iam-sem-supra": "645a97d7eb7c67737a5fc518db6190361532bd549ccdae6619aa7e55aa2f9db8",
  "medicamentos-iam": "dee2c364ba2c6e783173b585a29c67b3d7efb6498d68fc2351aef404ea85e17e",
  "complicacoes-iam": "0d5c578e7036c97a551a1d1a2589bd1fac876e12f0c8db365a799eb05bf78ee4",
  "avc": "436f0062dc06aaf77efe8ed9bae6b78a2e9aa0a23c55434e126baf1b4e54308e",
  "avc-isquemico": "58020d26e084fef4945bf9f8586c26b3deae2fcd827a5c0c3c8afeed2aaa3951",
  "trombolise-avc-isquemico": "a14aeecd8ca148193cebfbb421e57b6ef5e536a3dd7ff8cf65dcd3cd85046139",
  "trombectomia-avc-isquemico": "849ecc5972b30daf972575d5e50d852869b734fca3e72c20a6337aca115b70c0",
  "cuidados-pos-trombolise": "e11d293b15c14a7a95c62e69146cb2f6aafa0825c7e287e506e7d97a44913750",
  "medicamentos-avc-isquemico": "40112df6ee577588d6655a03176f1114685d7a07270afda53ff4db04138dfd2c",
  "avc-hemorragico": "560d18879979eb3d8a38d79271e9a413b295bbf044190ec1f99177bc1ff0d5bb",
  "fluxograma-final-avc": "675a1da93cf11bbdfffd25dae89e95ccc3efcd5daeb42445e0a9b1ac402e3cca",
  "via-aerea": "1ff6c51f00b11258ca655583c548b20fafdbd40aaccbf06a2b3ee97eb8e39f21",
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
    .filter((item) => item.available && item.slug)
    .map((item) => item.slug)
    .sort();
  const protocolSlugs = ACLS_PROTOCOLS.map((protocol) => protocol.slug).sort();

  assert.deepEqual(availableSlugs, protocolSlugs);
});
