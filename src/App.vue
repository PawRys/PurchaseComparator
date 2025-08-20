<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.min.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { charMap, getProductDetails, getUnifiedProductDetails } from '@/scripts/shared_functions'
import { ref } from 'vue'

const results = ref()
const invalidCount = ref(0)
const isWorking = ref(false)

const correctText = (input: string): string => {
  return input
    .split('')
    .map((char) => charMap[char] || char)
    .join('')
}

const getInvoiceNo = (gridFile: string[]): string | undefined => {
  for (let i = 0; i < gridFile.length; i++) {
    const InvoiceNo = gridFile[i].match(/LF[0-9]{2} M[0-9]{6}/)
    if (InvoiceNo && InvoiceNo[0]) return InvoiceNo[0]
  }
}

async function comparePurchaseDocuments(event: Event): Promise<void> {
  isWorking.value = true
  const target = event.target as HTMLInputElement
  const pdfFiles = target.files as FileList
  const textFiles = await extractTextFromPDF(pdfFiles)
  const compared = await compareTextFiles(textFiles)
  results.value = compared
  isWorking.value = false
}

async function compareTextFiles(textFiles: {
  LF: Map<string, string[]>
  PZ: Map<string, string[]>
  PZ_name: Map<string, string>
}) {
  invalidCount.value = 0
  const comparison = []
  const invoiceList = new Set([...textFiles.LF.keys(), ...textFiles.PZ.keys()])

  for (const invoiceNo of invoiceList) {
    const LF = textFiles.LF.get(invoiceNo)
    const PZ = textFiles.PZ.get(invoiceNo)
    const PZ_name = textFiles.PZ_name.get(invoiceNo)
    const allItems = new Set([...(LF || []), ...(PZ || [])])

    for (let index = 0; index < allItems.size; index++) {
      let x = '✔️'
      const LF_item = LF ? LF[index] : 'Brak dokumentu LF invoice'
      const PZ_item = PZ ? PZ[index] : 'Brak dokumentu PZ'
      if (!LF_item && !PZ_item) {
        continue
      }
      if (LF_item !== PZ_item) {
        x = '❌'
      }
      if (x === '✔️') {
        const str = `<span>${x} ${invoiceNo} / ${PZ_name ? PZ_name : ''}</span> <span>${LF_item}</span> <span>${PZ_item}</span>`
        comparison.push(str)
      }
      if (x === '❌') {
        const dif = searchForDiffers(LF_item, PZ_item)
        const str = `<span>${LF_item}</span> <span>${PZ_item}</span>`
        comparison.push(`<span>${x} ${invoiceNo} / ${PZ_name}</span> ${boldDiffers(str, dif)}`)
        invalidCount.value++
      }
    }
  }
  return comparison
}

function searchForDiffers(str1: string, str2: string) {
  const arr1 = (str1 || 'whatafak').replace(/x[0-9]+x/g, ' $& ').split(/[  ]+/)
  const arr2 = (str2 || 'whatafak').replace(/x[0-9]+x/g, ' $& ').split(/[  ]+/)
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  const uniqueArr1 = arr1.filter((item) => !set2.has(item))
  const uniqueArr2 = arr2.filter((item) => !set1.has(item))
  return [...uniqueArr1, ...uniqueArr2].sort().reverse()
}

function boldDiffers(str: string, dif: string[]) {
  const pattern = `(${dif.join('|').replace(/[.*+?^${}()]/g, '\\$&')})`
  const regex = new RegExp(pattern, 'g')
  return str.replace(regex, '<b>$1</b>').replace(/<\/b>([  ]*)<b>/g, '$1')
}

async function extractTextFromPDF(pdfFiles: FileList) {
  const filesCount = pdfFiles.length
  const LF: Map<string, string[]> = new Map()
  const PZ: Map<string, string[]> = new Map()
  const PZ_name: Map<string, string> = new Map()
  let unknownInvoiceCounter = 0

  const ensureGridSize = (grid: string[][], y: number, x: number): void => {
    while (grid.length <= y) {
      grid.push([])
    }
    while (grid[y].length <= x) {
      grid[y].push('')
    }
  }

  const setGridValue = (grid: string[][], y: number, x: number, text: string): void => {
    ensureGridSize(grid, y, x)
    grid[y][x] = text
  }

  const removeEmptyGridCells = (grid: string[][]): void => {
    for (let row = 0; row < grid.length; row++) {
      for (let cell = 0; cell < grid[row].length; cell++) {
        if (grid[row][cell].length === 0) {
          grid[row].splice(cell, 1)
          cell--
        }
      }
      if (grid[row].length === 0) {
        grid.splice(row, 1)
        row--
      }
    }
  }

  for (let fileIndex = 0; fileIndex < filesCount; fileIndex++) {
    const currentFile = pdfFiles[fileIndex]
    if (currentFile.type !== 'application/pdf') {
      console.log(`Invalid file type: ${currentFile.type}`, currentFile)
      continue
    }

    const arrayBuffer = await currentFile.arrayBuffer()
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    const pagesCount = pdf.numPages
    const gridFile: string[] = []

    for (let pageIndex = 1; pageIndex <= pagesCount; pageIndex++) {
      const grid: string[][] = []
      const page = await pdf.getPage(pageIndex)
      const content = await page.getTextContent()
      const contentSize = content.items.length

      const resolution = 2
      for (let i = 0; i < contentSize; i++) {
        const item = content.items[i] as TextItem
        const x = Math.round(item.transform[4] / resolution)
        const y = Math.round(item.transform[5] / resolution)
        const text: string = correctText(item.str).replace(/([0-9]{1,3},[0-9]{1,3})/, ' $1')

        setGridValue(grid, y, x, `${text}`)
      }

      removeEmptyGridCells(grid)

      gridFile.push(...grid.reverse().map((row) => row.join('')))
    }

    if (currentFile.name.match(/LF[0-9]{2} M[0-9]{6}/)) {
      const invoiceNo =
        getInvoiceNo([currentFile.name]) || `unknown invoice ${unknownInvoiceCounter++}`
      const temp = getProductDetails(gridFile)
      const productsToCompare = getUnifiedProductDetails(temp)
      LF.set(`${invoiceNo}`, productsToCompare)
    }

    if (currentFile.name.match(/[0-9]{2}-PZ [0-9]{4}[A-Z]{2,}/)) {
      const PZName = currentFile.name.match(/[0-9]{2}-PZ [0-9]{4}[A-Z]{2,}/)
      const invoiceNo = getInvoiceNo(gridFile) || `unknown invoice ${unknownInvoiceCounter++}`
      const productsToCompare = getUnifiedProductDetails(gridFile)
      PZ.set(`${invoiceNo}`, productsToCompare)
      PZ_name.set(`${invoiceNo}`, PZName ? PZName[0] : 'Nieznany numer PZ')
    }
  }
  return { LF: LF, PZ: PZ, PZ_name: PZ_name }
}

function hashToHSL(hash: number) {
  const h = hash * 360 * 0.6180339887498949
  const s = 60
  const l = 60
  return `hsl(${h}, ${s}%, ${l}%)`
}

function stringToHSL(str: string) {
  const invNumber = str.match(/LF\d{2} M\d{6}/)
  const num = nextNumber(invNumber ? invNumber[0] : '')
  return hashToHSL(num)
}

let counter = 0
let lastInvoice = ''
function nextNumber(invoiceIndex: string): number {
  if (lastInvoice !== invoiceIndex) {
    lastInvoice = invoiceIndex
    counter++
  }

  return counter
}
</script>

<template>
  <header class="noprint">
    <p>
      <a href="https://pawrys.github.io/StockBrowser5/">Stany</a>
      <span> / </span>
      <a href="https://pawrys.github.io/LabelGenerator/">Etykiety</a>
      <span> / </span>
      <a href="https://pawrys.github.io/PurchaseComparator/">Tester</a>
    </p>

    <h1>Tester PZ</h1>
    <p>Narzędzie do porównywania PZ z fakturą LF.</p>
    <p>
      PDF z naszym PZ musi zawierać dokładny numer faktury z LF (<b>LFxx Mxxxxxx</b>), oraz
      ustawione w opcjach wydruku <b>kod towaru obok nazwy towaru</b>. Można zaznaczyć i "wgrać"
      wiele plików jednocześnie.
    </p>
  </header>

  <main>
    <div class="button-bar noprint">
      <label for="file-upload" class="button cta">
        <span>Dodaj pliki</span>
      </label>
    </div>
    <input
      type="file"
      name="file-upload"
      id="file-upload"
      class="button"
      multiple
      @change="comparePurchaseDocuments"
      hidden
      style="display: none"
    />

    <h3 v-if="isWorking">Pracuję...</h3>
    <section v-else>
      <h3 v-if="!results">Załaduj parami PZ + LF invoice</h3>
      <h3 v-if="results && invalidCount === 0">Wszystko git ({{ results.length }} testów)</h3>
      <h3 v-if="results && invalidCount > 0">
        Znaleziono {{ invalidCount }} błędów na {{ results.length }} pozycji.
      </h3>
      <label v-if="results" for="valid_items" class="show-valid noprint">
        <input type="checkbox" name="valid_items" id="valid_items" />
        <span>Pokaż prawidłowe</span>
      </label>

      <div
        v-for="item in results"
        :key="item"
        v-html="item"
        :class="{ valid: item.match('✔️'), invalid: item.match('❌') }"
        :style="`border-left: solid 1ch ${stringToHSL(item)}`"
      ></div>
    </section>

    <!--section id="test">
      <div v-for="i in 100" :key="i" :style="`background-color: ${hashToHSL(i)}`"></div>
    </section-->
  </main>

  <footer>
    <p>Wszelkie prawa zastrzeżone - Paweł Ryszkowski</p>
    <p>
      Uwagi i pomoc techniczna:
      <a href="mailto:pawrys.kontakt@gmail.com?subject=Pomoc%20Tester%20PZ" target="_blank"
        >pawrys.kontakt@gmail.com</a
      >
      <span> - </span>
      <a href="https://github.com/PawRys/">Github/PawRys</a>
    </p>
    <p></p>
  </footer>
</template>

<style scoped>
#test {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  width: min-content;
}
#test > div {
  width: 25px;
  height: 25px;
  margin: 2px;
}

.button-bar {
  align-items: baseline;
  display: flex;
  gap: 1em;
}

.button {
  background-color: steelblue;
  color: white;
  padding: 5px 8px;
  border-radius: 5px;
}

.show-valid {
  cursor: pointer;
  display: flex;
  gap: 1em;
}

.show-valid ~ .valid {
  display: none;
}

.show-valid:has(:checked) ~ .valid {
  display: revert;
}

:is(.valid, .invalid) {
  margin-block: 1em;
  padding-left: 1ch;
}
</style>

<style>
:is(.valid, .invalid) span {
  display: block;
}

:is(.valid, .invalid) span:nth-of-type(2)::before {
  content: 'LF:';
  color: brown;
}

:is(.valid, .invalid) span:nth-of-type(3)::before {
  content: 'PZ:';
  color: navy;
}

:is(.valid, .invalid) span:nth-of-type(2)::before,
:is(.valid, .invalid) span:nth-of-type(3)::before {
  display: inline-block;
  font-weight: 600;
  width: 3ch;
  margin-left: 1ch;
}

.invalid {
  line-height: 1.6;
}

.invalid b {
  font-weight: 600;
  outline-color: crimson;
  outline-style: auto;
  outline-width: 1px;
  padding: 0px 2px;
  margin: 0px 2px;
}

@media print {
  .noprint {
    display: none !important;
  }

  :is(.valid, .invalid) {
    page-break-inside: avoid;
  }
}
</style>
