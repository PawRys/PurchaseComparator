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

const sizeMap: { [key: string]: string } = {
  '01': '1475x1475',
  '02': '1525x1525',
  '03': '1220x2440',
  '04': '2440x1220',
  '05': '1250x2500',
  '06': '2500x1250',
  '07': '1500x2500',
  '08': '2500x1500',
  '09': '1525x2500',
  '10': '2500x1525',
  '11': '1525x3050',
  '12': '1500x3000',
  '13': '1240x1240',
  '14': '1220x3050',
  '15': '1550x3000',
  '16': '1500x2400',
  '17': '1550x2500',
  '18': '1550x3080',
  '19': '1300x3050',
  '20': '2130x1250',
  '21': '1200x2500',
  '22': '1525x2440',
  '23': '1500x2700',
  '24': '1525x2230',
  '25': '1250x2230',
  '26': '2150x1250',
  '27': '2150x3850',
  '28': '1525x3000',
  '29': '1250x3050',
  '30': '1250x3000',
  '31': '1220x3000',
  '32': '1200x3000',
  '33': '1560x3080',
  '34': '1220x3080',
  '35': '1560x2750',
  '36': '2540x1270',
  '37': '1270x2540',
  '38': '1220x2400',
  '39': '1220x2500',
  '40': '1270x2550',
  '41': '1200x2700',
  '42': '1500x1500',
  '43': '1525x1475',
  '44': '1220x2700',
  '45': '1560x2500',
  '46': '2400x1220',
  '47': '1250x2440',
  '48': '1500x2499',
  '49': '2000x1500',
  '50': '1500x2100',
  '51': '1220x2750',
  '52': '1500x2750',
  '53': '1550x1550',
  '54': '2500x1220',
  '55': '1525x2745',
  '56': '1525x2750',
  '57': '2150x3340',
  '58': '1250x3030',
  '59': '1200x2440',
  '60': '1250x2750',
  '61': '1500x2600',
  '62': '2150x3050',
  '63': '1250x2700',
  '64': '1200x2400',
  '65': '1525x2150',
  '66': '1500x3300',
  '67': '1350x2700',
  '68': '1190x2676',
  '69': '2150x1525',
  '70': '1530x2230',
  '71': '1520x2200',
  '72': '625x2500',
  '73': '2400x1200',
  '74': '1110x2400',
  '75': '2150x4000',
  '76': '1525x3660',
  '77': '2290x4000',
  '78': '1200x3300',
  '79': '675x2500',
  '80': '1525x2700',
  '81': '1500x1220',
  '82': '1500x3600',
  '83': '1250x3300',
  '84': '1700x2500',
  '85': '1900x3850',
  '86': '1220x3660',
  '87': '1250x2800',
  '88': '1500x3660',
  '89': '1200x2750',
  '90': '1525x3340',
  '91': '1900x3340',
  '92': '1900x3050',
  '93': '1900x4000',
  '94': '1250x3660',
  '95': '1860x4000',
  '96': '1850x1525',
  '97': '2000x4000',
  '98': '1250x3340',
  '99': '1250x3600',
  '100': '2150x3660',
  '101': '1280x2550',
  '102': '1830x1525',
  '103': '2000x2500',
  '104': '1850x3660',
  '105': '2000x5400',
  '106': '1850x1220',
  '107': '1850x3660',
  '108': '1900x3000',
  '109': '1850x3050',
  '110': '1850x1250',
  '111': '2350x4150',
  '112': '1825x3340',
  '113': '1830x3660',
  '114': '1500x2570',
  '115': '1540x3065',
  '116': '1670x3305',
  '117': '1250x3075',
  '118': '1245x2465',
  '119': '1240x2450',
  '120': '1850x3340',
  '121': '1205x2500',
  '122': '1220x1830',
  '123': '1350x2700',
  '124': '1190x3276',
  '125': '1326x3276',
  '126': '1500x3500',
  '127': '1545x3080',
  '128': '2750x1520',
  '129': '1540x3080',
  '130': '1350x2346',
  '131': '1350x2674',
  '132': '1250x2070',
  '133': '1500x2674',
  '134': '1500x320',
  '135': '2000x3850',
  '136': '1250x2455',
  '137': '2000x3000',
  '138': '1500x2440',
  '139': '1826x3070',
  '140': '1826x3670',
  '141': '2022x3047',
  '142': '2104x3511',
  '143': '1250x1990',
  '144': '1525x3300',
  '145': '1205x3020',
  '146': '1500x2400',
  '147': '1270x1525',
  '148': '1500x3340',
  '149': '1320x3050',
  '150': '1850x3100',
  '151': '1850x2700',
  '152': '1305x2875',
  '153': '1305x2525',
  '154': '2000x1250',
  '155': '1500x3365',
  '156': '1000x3000',
  '157': '1710x3000',
  '158': '1525x2464',
  '159': '2000x4150',
  '160': '1900x4150',
  '161': '1800x3050',
  '162': '1290x2500',
  '163': '1830x3340',
  '164': '2130x3500',
  '165': '2000x3850',
  '166': '1250x3660',
  '167': '1270x1270',
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
    const glue = getGlueType(array[i]) || 'brak-kleju'
    const face = getFaceType(array[i])
    const color = getColor(array[i], face)
    const quant = getQuantity(array[i]) || 'brak-ilosci'
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
  return `${quant || 'brak-ilosci'} ${unit || 'brak-jmiary'}`
}

function getSize(input: string): string | undefined {
  const size = input.match(/\d+([,.]\d+)?x\d{2,4}x\d{2,4}/i)
  const code = input.match(/\d{2,3}S\d{2}\/(\d{2,3})/i)
  let codeCheck: boolean = true
  if (code && size) {
    codeCheck = size[0].includes(sizeMap[code[1]])
  }

  return size ? `${size[0].replace(/,/g, '.')}${codeCheck ? '' : ' zły_kod'}` : undefined
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

  const regexpGrade = /\b(S|B|BB|CP|WG|WGE|C|CC|V|[WFM]( ?[ALT])?( I{1,2})?)\b/
  const expression = new RegExp(`${regexpGrade.source}/${regexpGrade.source}`, 'gi')
  if (expression.test(text)) {
    const grade = text.match(expression)
    result = grade ? grade[0] : '??/??'
    result = result.replace(/( ?[ALT])?( I{1,2})?/g, '')
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
  /*4*/ if (/s13\/|s15\/|s17\/|([WFM]( ?[ALT])? II)/gi.test(text)) result += ' II'

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
