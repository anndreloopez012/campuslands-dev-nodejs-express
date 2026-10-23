const EXPECT_PATTERN = /^#\s*expect:\s*(\d+)/;
const REQUEST_LINE_PATTERN = /^(GET|POST|PATCH|PUT|DELETE)\s+(\S+)/;
const HEADER_LINE_PATTERN = /^([\w-]+):\s?(.+)$/;

function parseHttpCollection(raw) {
  const blocks = raw.replace(/\r\n/g, "\n").split(/^###[ \t]*/m).slice(1);

  return blocks.map((block, index) => {
    const lines = block.split("\n");
    const title = lines[0].trim();
    let i = 1;

    const skipBlank = () => {
      while (i < lines.length && lines[i].trim() === "") i++;
    };

    skipBlank();
    const expectMatch = lines[i]?.match(EXPECT_PATTERN);
    if (!expectMatch) throw new Error(`Bloque #${index + 1} ("${title}") no declara "# expect: <status>"`);
    const expectedStatus = Number(expectMatch[1]);
    i++;

    skipBlank();
    const requestMatch = lines[i]?.match(REQUEST_LINE_PATTERN);
    if (!requestMatch) throw new Error(`Bloque #${index + 1} ("${title}") no tiene una linea de peticion valida`);
    const [, method, url] = requestMatch;
    i++;

    const headers = {};
    while (i < lines.length && HEADER_LINE_PATTERN.test(lines[i])) {
      const [, name, value] = lines[i].match(HEADER_LINE_PATTERN);
      headers[name] = value;
      i++;
    }

    skipBlank();
    const body = lines.slice(i).join("\n").trim() || undefined;

    return { title, expectedStatus, method, url, headers, body };
  });
}

export { parseHttpCollection };
