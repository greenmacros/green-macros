/** EAN-8 / UPC-A / EAN-13 / GTIN-14 (JAN is EAN-13): digits only, with a valid check digit. */
export function validBarcode(code) {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
  const digits = [...code].map(Number);
  const check = digits.pop();
  const sum = digits.reverse().reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

/** Strip spaces/hyphens and full-width digits so pasted codes work. */
export const cleanBarcode = raw => String(raw).normalize("NFKC").replace(/[\s-]/g, "");

/** Open Food Facts' "add a product" page, pre-filled with the barcode when we have a valid one. */
export function offAddUrl(code, lang = "en") {
  const host = lang === "ja" ? "jp" : "world";
  const base = `https://${host}.openfoodfacts.org/cgi/product.pl?type=product`;
  return validBarcode(code) ? `${base}&code=${code}` : base;
}
