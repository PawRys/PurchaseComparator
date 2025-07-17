const regExp_ItemSize: RegExp = /\b\d+x\d+x\d+\b/i // 12x1250x2500
// const regExp_ContarctNo: RegExp = /\b(Contract)\b/i
const regExp_ItemPacking: RegExp = /\b([0-9]+([,.][0-9]+)? (cbm|sqr|pcs|m3|m2|szt))\b/i
const regExp_ItemGlueing: RegExp = /\b(EXT|WD|INT|MR)\b/i
const regExp_ItemDescription: RegExp = /\b(Birch plywood|KILO|PQ)\b/i

export const charMap: { [key: string]: string } = {
  ą: 'ą',
  ü: 'ć',
  Ċ: 'ę',
  á: 'ł',
  Ĕ: 'ń',
  ó: 'ó',
  Ğ: 'ś',
  Ī: 'ż',
  Ĩ: 'ź',
  Ą: 'Ą',
  û: 'Ć',
  ĉ: 'Ę',
  à: 'Ł',
  ē: 'Ń',
  Ó: 'Ó',
  ĝ: 'Ś',
  ĩ: 'Ż',
  ħ: 'Ź',
}

export interface LabelInterface {
  contract: string
  longDesc: string
  itemSize: string
  itemGlue: string
  packsCount: string
  packSize: string
}

export function getProductDetails(items: string[]): string[] {
  // console.log(items)

  const result = []
  const itemsLength = items.length
  let itemSize: string = ''
  let itemGlueing: string = ''
  let itemQuantity: string = ''
  let itemDescription: string = ''
  let itemType: string = ''

  for (let i = 0; i < itemsLength; i++) {
    const item = items[i] as string

    if (regExp_ItemGlueing.test(item)) {
      itemGlueing = getItemGlueing(item)
      itemType = 'itemGlueing'
    }

    if (regExp_ItemDescription.test(item)) {
      itemDescription = getPurifiedDescription(item)
      itemType = 'itemDescription'
    }

    if (regExp_ItemSize.test(item)) {
      itemSize = getPurifiedSize(item)
      itemType = 'itemSize'
    }

    if (regExp_ItemPacking.test(item)) {
      itemQuantity = getPackingInfo(item)
      itemType = 'itemPacking'
    }

    if (itemType === 'itemPacking') {
      result.push(`${itemGlueing} ${itemSize} ${itemDescription} ${itemQuantity}`)
      itemType = ''
    }
  }

  return result
}

function getPurifiedDescription(input: string | null): string {
  const destructuredName: Array<string> = input?.split(', ') || []
  const purifiedName: Array<string> = []
  for (let text of destructuredName) {
    // Ommit junk chunks
    if (text.match(/(edges sealed|Const|Spec|441233\d\d|\(1\)\(2\)|RAL|EXT|WD|INT|MR)/i)) continue
    // Erase junk words
    text = text
      // .replace(/\b(Birch plywood RIGA|MEL|TEX|FORM|PLY|COMPOSITE)\b/gi, '')
      .replace(/\b(CODE|WPC|SP1|1F45M|R7010|without|\d{5,})\b/gi, '')
      .trim()
    purifiedName.push(text)
  }
  return purifiedName.join(' ') || "it's null"
}

function getPurifiedSize(input: string): string {
  const matching = input?.match(/\b\d+([,.]\d+)?x\d+x\d+\b/i) || ['0x0x0']
  return matching[0]
}

function getPackingInfo(input: string): string {
  const matching = input?.match(regExp_ItemPacking) || ['0 cbm']
  return matching[0]
}

function getItemGlueing(input: string): string {
  const matching = input?.match(/\b(EXT|WD|INT|MR)\b/i) || ['']
  return matching[0]
}

/**-------------------------------------------------------- */

export function getUnifiedProductDetails(array: string[]): string[] {
  const result = []
  let counter = 0
  for (let i = 0; i < array.length; i++) {
    const size = getSize(array[i])
    const glue = getGlueType(array[i]) || '404-glue'
    const face = getFaceType(array[i])
    const color = getColor(array[i], face)
    const quant = getQuantity(array[i]) || '404-quant'
    if (size && !array[i].match(/Pozycja [0-9]{1,}/)) {
      result.push(`${++counter}. ${glue} ${size} ${face} ${color} - ${quant}`)
    }
  }
  // console.log(result)

  return result
}

function getQuantity(input: string): string | undefined {
  const match = input.match(/([0-9]+([,.][0-9]+){0,1}) (cbm|sqr|pcs|m3|m2|szt)/)
  const match_quant = match ? match[0].match(/([0-9]+([,.][0-9]+){0,1})/) : undefined
  const match_unit = match ? match[0].match(/cbm|sqr|pcs|m3|m2|szt/) : undefined

  const replacements: Record<string, string> = { cbm: 'm3', sqr: 'm2', pcs: 'szt' }

  const quant = match_quant ? Number(match_quant[0].replace(/,/g, '.')).toFixed(3) : undefined
  const unit = match_unit
    ? match_unit[0].replace(/cbm|sqr|pcs/g, (match) => replacements[match])
    : undefined
  return `${quant || '404-quant'} ${unit || '404-unit'}`
}

function getSize(input: string): string | undefined {
  const match = input.match(/\d+([,.]\d+)?x\d{2,4}x\d{2,4}/i)
  return match ? match[0].replace(/,/g, '.') : undefined
}

function getGlueType(text: string): string | undefined {
  let result = undefined
  if (/foliowana|antypo|melamin|M\?M/g.test(text)) result = 'WD'
  if (/wodo|\bWD\b|\bEXT\b|\bE\b/g.test(text)) result = 'WD'
  if (/sucho|\bMR\b|\bINT\b/g.test(text)) result = 'MR'
  return result
}

function getFaceType(text: string): string | undefined {
  let result = undefined

  const regexpGrade = /\b(S|B|BB|CP|WG|WGE|C|CC|V|[WFM][ALT]?( I{1,2})?)\b/
  const expression = new RegExp(`${regexpGrade.source}/${regexpGrade.source}`, 'gi')
  if (expression.test(text)) {
    const grade = text.match(expression)
    result = grade ? grade[0] : '??/??'
    result = result.replace(/[ALT]? I{1,2}/g, '')
  }
  /*!!! Keep order. Any order if equal number. !!! */

  /*1*/ if (/s01\//gi.test(text)) result = 'B/B'
  /*1*/ if (/s02\//gi.test(text)) result = 'B/BB'
  /*1*/ if (/s03\//gi.test(text)) result = 'S/BB'
  /*1*/ if (/s04\//gi.test(text)) result = 'BB/BB'
  /*1*/ if (/s05\//gi.test(text)) result = 'BB/CP'
  /*1*/ if (/s06\//gi.test(text)) result = 'BB/WG'
  /*1*/ if (/s07\//gi.test(text)) result = 'CP/CP'
  /*1*/ if (/s08\//gi.test(text)) result = 'WGE/WGE'
  /*1*/ if (/s09\//gi.test(text)) result = 'WG/WG'
  /*1*/ if (/s10\//gi.test(text)) result = 'C/C'
  /*1*/ if (/s11\//gi.test(text)) result = 'Kilo'
  /*1*/ if (/s12\/|s13\//gi.test(text)) result = 'F/F' // II applied in *4*
  /*1*/ if (/s14\/|s15\//gi.test(text)) result = 'W/F' // II applied in *4*
  /*1*/ if (/s16\/|s17\//gi.test(text)) result = 'W/W' // II applied in *4*
  /*1*/ if (/s18\//gi.test(text)) result = 'CP/C'
  /*1*/ if (/s19\//gi.test(text)) result = 'M/WG'
  /*1*/ if (/s20\//gi.test(text)) result = 'F/BB'
  /*1*/ if (/s21\//gi.test(text)) result = 'F/WG'
  /*1*/ if (/s22\//gi.test(text)) result = 'BB/C'
  /*1*/ if (/s23\//gi.test(text)) result = 'W/BB'
  /*1*/ if (/s24\//gi.test(text)) result = 'W/WG'
  /*1*/ if (/s25\//gi.test(text)) result = 'B/WG'
  /*1*/ if (/s26\//gi.test(text)) result = 'F/WH'
  /*1*/ if (/s27\//gi.test(text)) result = 'W/CP'
  /*1*/ if (/s28\//gi.test(text)) result = 'S/WG'
  /*1*/ if (/s29\//gi.test(text)) result = 'S/CP'
  /*1*/ if (/s30\//gi.test(text)) result = 'V/V'
  /*1*/ if (/s31\//gi.test(text)) result = 'OSB3'
  /*1*/ if (/s32\//gi.test(text)) result = 'OSB T&G'
  /*1*/ if (/s35\//gi.test(text)) result = 'BB/CC'

  /*2.1*/ if (/\bkilo\b/gi.test(text)) result = 'Kilo'
  /*2.2*/ if (/\bPQ\b/gi.test(text)) result = 'PQ'
  /*2.3*/ if (/\bPQ\W?F\b/gi.test(text)) result = 'PQF'
  /*3*/ if (/\bF\/W\W?H\b|Heksa/gi.test(text)) result = 'Heksa'
  /*3*/ if (/\bF\/W\W?H\W?\+|Heksa\W?\+|Heksa Plus/gi.test(text)) result = 'Heksa Plus'
  /*3*/ if (/\bM\/M\b|MEL|\bopal white\b/gi.test(text)) result = 'M/M'
  // /*3*/ if (/\bhoney\b/gi.test(text)) result = 'Honey'
  // /*3*/ if (/\bM\/M\b|mel/gi.test(text)) result = 'M/M'
  // /*3*/ if (/\bopal\b/gi.test(text)) result = 'Opal'
  // /*3*/ if (/\bopal white\b/gi.test(text)) result = 'Opal White'
  /*3*/ if (/\bPF\b|poliform/gi.test(text)) result = 'Poliform'
  /*3*/ if (/\bPPL\b/gi.test(text)) result = 'PPL'
  /*3*/ if (/OSB/gi.test(text)) result = 'OSB'

  /*4*/ // !important Apply II grade at the end
  // /*4*/ if (/s13\/|s15\/|s17\/|((WT|FA|MA|W|F|M) II)/gi.test(text)) result += ' II'
  /*4*/ if (/s13\/|s15\/|s17\/|([WFM][ALT]? II)/gi.test(text)) result += ' II'

  return result
}

function getColor(text: string, faceType: string | undefined): string | undefined {
  const results = new Set()

  if (/\bhoney\b/gi.test(text)) results.add('honey')
  if (/yell|zółt[ya]/gi.test(text)) results.add('yellow')
  if (/black|czarn[ya]/gi.test(text)) results.add('black')
  if (/green|zielon[ya]/gi.test(text)) results.add('green')
  if (/blue|niebiesk[ia]/gi.test(text)) results.add('blue')
  if (/\bred\b|czerwon[ya]/gi.test(text)) results.add('red')
  if (/(?<!(opal ?))(white)/gi.test(text)) results.add('white')
  if (/(?<=(opal ?))(white)/gi.test(text)) results.add('opal white')
  if (/c\.less|transp|bezbarwna|colorless/gi.test(text)) results.add('c.less')
  if (/(?<!(l\. ?|jasn[yoa] ?|light ?))(grey|szar[ya])/gi.test(text)) results.add('grey')
  if (/(?<=(l\. ?|jasn[yoa] ?|light ?))(grey|szar[ya])/gi.test(text)) results.add('l.grey')
  if (/(?<=(l\. ?|jasn[yoa] ?|light ?))(br|brąz|brown)/gi.test(text)) results.add('l.brown')
  if (/(?<!(l\. ?|jasn[yoa] ?|light ?))(d\.)?(br|brąz|brown)\b/gi.test(text)) results.add('d.brown')

  /* Apply defaults if no color specified */
  if (results.size === 0) {
    if (faceType?.match('F/F')) results.add('d.brown')
    if (faceType?.match('F/W')) results.add('d.brown')
    if (faceType?.match('W/F')) results.add('d.brown')
    if (faceType?.match('W/W')) results.add('d.brown')
    if (faceType?.match('Heksa')) results.add('d.brown')
    if (faceType?.match('M/M')) results.add('white')
    // if (faceType?.match('Poliform')) results.add('(nieznany)')
    // if (faceType?.match('PPL')) results.add('(nieznany)')
    // if (faceType?.match('PQF')) results.add('(nieznany)')
  }

  // if (results.size === 0 && faceType) results.add('(brak)')
  // else results.add('(laminat)')
  // if (results.size === 0) results.add('(---)')
  return Array.from(results).join(' ')
}
