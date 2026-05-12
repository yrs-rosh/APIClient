export function parseYaml(text) {
  const rawLines = text.replace(/\r/g, '').split('\n')
  const lines = rawLines
    .map((raw) => {
      const withoutTabs = raw.replace(/\t/g, '  ')
      const stripped = stripComment(withoutTabs).trimEnd()
      return {
        indent: stripped.match(/^ */)?.[0].length || 0,
        text: stripped.trim(),
      }
    })
    .filter((line) => line.text.length > 0)

  if (!lines.length) {
    return {}
  }

  const [value] = parseYamlBlock(lines, 0, lines[0].indent)
  return value
}

function parseYamlBlock(lines, index, indent) {
  const current = lines[index]
  if (!current || current.indent < indent) {
    return [null, index]
  }

  if (current.text.startsWith('- ')) {
    return parseYamlSequence(lines, index, current.indent)
  }

  return parseYamlMapping(lines, index, current.indent)
}

function parseYamlMapping(lines, index, indent, seed = {}) {
  const result = { ...seed }
  let cursor = index

  while (cursor < lines.length) {
    const line = lines[cursor]
    if (line.indent < indent || line.text.startsWith('- ')) {
      break
    }
    if (line.indent > indent) {
      break
    }

    const pair = splitYamlPair(line.text)
    if (!pair) {
      throw new Error(`Could not read YAML line: ${line.text}`)
    }

    const [rawKey, rawValue] = pair
    const key = unquote(rawKey.trim())
    const value = rawValue.trim()

    if (isYamlBlockScalar(value)) {
      const [block, nextCursor] = readYamlBlockScalar(
        lines,
        cursor + 1,
        line.indent,
        value.startsWith('>'),
      )
      result[key] = block
      cursor = nextCursor
    } else if (value === '') {
      const next = lines[cursor + 1]
      if (next && next.indent >= line.indent && next.text.startsWith('- ')) {
        const [child, nextCursor] = parseYamlSequence(
          lines,
          cursor + 1,
          next.indent,
        )
        result[key] = child
        cursor = nextCursor
      } else if (next && next.indent > line.indent) {
        const [child, nextCursor] = parseYamlBlock(lines, cursor + 1, next.indent)
        result[key] = child
        cursor = nextCursor
      } else {
        result[key] = {}
        cursor += 1
      }
    } else {
      const [scalar, nextCursor] = readYamlPlainContinuation(
        lines,
        cursor + 1,
        line.indent,
        parseYamlScalar(value),
      )
      result[key] = scalar
      cursor = nextCursor
    }
  }

  return [result, cursor]
}

function parseYamlSequence(lines, index, indent) {
  const result = []
  let cursor = index

  while (cursor < lines.length) {
    const line = lines[cursor]
    if (line.indent !== indent || !line.text.startsWith('- ')) {
      break
    }

    const rest = line.text.slice(2).trim()
    if (!rest) {
      const next = lines[cursor + 1]
      if (next && next.indent > indent) {
        const [child, nextCursor] = parseYamlBlock(lines, cursor + 1, next.indent)
        result.push(child)
        cursor = nextCursor
      } else {
        result.push(null)
        cursor += 1
      }
      continue
    }

    const pair = splitYamlPair(rest)
    if (pair) {
      const [rawKey, rawValue] = pair
      const key = unquote(rawKey.trim())
      const value = rawValue.trim()
      let item = {}
      let nextCursor = cursor + 1

      if (isYamlBlockScalar(value)) {
        const [block, blockCursor] = readYamlBlockScalar(
          lines,
          cursor + 1,
          line.indent,
          value.startsWith('>'),
        )
        item[key] = block
        nextCursor = blockCursor
      } else if (value === '') {
        const next = lines[cursor + 1]
        if (next && next.indent >= line.indent && next.text.startsWith('- ')) {
          const [child, childCursor] = parseYamlSequence(
            lines,
            cursor + 1,
            next.indent,
          )
          item[key] = child
          nextCursor = childCursor
        } else if (next && next.indent > indent) {
          const [child, childCursor] = parseYamlBlock(lines, cursor + 1, next.indent)
          item[key] = child
          nextCursor = childCursor
        } else {
          item[key] = {}
        }
      } else {
        const [scalar, scalarCursor] = readYamlPlainContinuation(
          lines,
          cursor + 1,
          line.indent,
          parseYamlScalar(value),
        )
        item[key] = scalar
        nextCursor = scalarCursor
      }

      const next = lines[nextCursor]
      if (next && next.indent > indent && !next.text.startsWith('- ')) {
        const [merged, mergedCursor] = parseYamlMapping(
          lines,
          nextCursor,
          next.indent,
          item,
        )
        item = merged
        nextCursor = mergedCursor
      }

      result.push(item)
      cursor = nextCursor
      continue
    }

    result.push(parseYamlScalar(rest))
    cursor += 1
  }

  return [result, cursor]
}

function readYamlBlockScalar(lines, index, parentIndent, folded) {
  const parts = []
  let cursor = index

  while (cursor < lines.length && lines[cursor].indent > parentIndent) {
    parts.push(lines[cursor].text)
    cursor += 1
  }

  return [folded ? parts.join(' ') : parts.join('\n'), cursor]
}

function readYamlPlainContinuation(lines, index, parentIndent, value) {
  if (typeof value !== 'string') {
    return [value, index]
  }

  const parts = [value]
  let cursor = index

  while (cursor < lines.length) {
    const line = lines[cursor]
    if (
      line.indent <= parentIndent ||
      line.text.startsWith('- ') ||
      splitYamlPair(line.text)
    ) {
      break
    }

    parts.push(line.text)
    cursor += 1
  }

  return [parts.join(' '), cursor]
}

function isYamlBlockScalar(value) {
  return /^[>|][+-]?$/.test(value)
}

function stripComment(line) {
  let quote = ''
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const previous = line[index - 1]
    if ((char === '"' || char === "'") && previous !== '\\') {
      quote = quote === char ? '' : quote || char
    }
    if (char === '#' && !quote && (index === 0 || /\s/.test(previous))) {
      return line.slice(0, index)
    }
  }
  return line
}

function splitYamlPair(text) {
  let quote = ''
  let depth = 0
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const previous = text[index - 1]
    if ((char === '"' || char === "'") && previous !== '\\') {
      quote = quote === char ? '' : quote || char
    } else if (!quote && ['[', '{', '('].includes(char)) {
      depth += 1
    } else if (!quote && [']', '}', ')'].includes(char)) {
      depth -= 1
    } else if (char === ':' && !quote && depth === 0) {
      return [text.slice(0, index), text.slice(index + 1)]
    }
  }
  return null
}

function parseYamlScalar(value) {
  const trimmed = value.trim()
  if (trimmed === 'null' || trimmed === '~') {
    return null
  }
  if (trimmed === 'true') {
    return true
  }
  if (trimmed === 'false') {
    return false
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed)
  }
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return unquote(trimmed)
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim()
    return inner ? splitInlineValues(inner).map(parseYamlScalar) : []
  }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1).trim()
    if (!inner) {
      return {}
    }
    return splitInlineValues(inner).reduce((object, part) => {
      const pair = splitYamlPair(part)
      if (pair) {
        object[unquote(pair[0].trim())] = parseYamlScalar(pair[1])
      }
      return object
    }, {})
  }
  return trimmed
}

function splitInlineValues(text) {
  const values = []
  let current = ''
  let quote = ''
  let depth = 0

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const previous = text[index - 1]
    if ((char === '"' || char === "'") && previous !== '\\') {
      quote = quote === char ? '' : quote || char
    } else if (!quote && ['[', '{', '('].includes(char)) {
      depth += 1
    } else if (!quote && [']', '}', ')'].includes(char)) {
      depth -= 1
    }

    if (char === ',' && !quote && depth === 0) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim()) {
    values.push(current.trim())
  }
  return values
}

function unquote(value) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'")
  }
  return trimmed
}
