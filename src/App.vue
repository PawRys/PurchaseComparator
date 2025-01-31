<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.min.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { charMap, getProductDetails, getUnifiedProductDetails } from '@/scripts/shared_functions'
import { ref } from 'vue'

const results = ref()
const isWorking = ref('')

const correctText = (input: string): string => {
  return input
    .split('')
    .map((char) => charMap[char] || char) // Zamiana znaku, jeśli istnieje w mapie
    .join('')
}

const getInvoiceNo = (gridFile: string[]): string | undefined => {
  for (let i = 0; i < gridFile.length; i++) {
    const InvoiceNo = gridFile[i].match(/LF[0-9]{2} M[0-9]{6}/)
    if (InvoiceNo && InvoiceNo[0]) return InvoiceNo[0]
  }
}

async function compareFiles(event: Event): Promise<void> {
  isWorking.value = 'Pracuję'
  const target = event.target as HTMLInputElement
  const pdfFiles = target.files as FileList
  const textFiles = await extractTextFromPDF(pdfFiles)
  const compared = await compareTextFiles(textFiles)
  results.value = compared
  isWorking.value = 'Zrobione'
}

async function compareTextFiles(textFiles: {
  LF: Map<string, string[]>
  PZ: Map<string, string[]>
}) {
  const compare = []
  const invoiceList = new Set([...textFiles.LF.keys(), ...textFiles.PZ.keys()])

  for (const invoiceNo of invoiceList) {
    const LF = textFiles.LF.get(invoiceNo)
    const PZ = textFiles.PZ.get(invoiceNo)
    const allItems = new Set([...(LF || []), ...(PZ || [])])

    console.log(allItems, LF, PZ)

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
        const str = `${x} <i>${invoiceNo}</i> \n\t${LF_item}\n\t${PZ_item}`
        compare.push(str)
      }
      if (x === '❌') {
        const dif = removeDuplicates(LF_item, PZ_item)
        const str = `\n\t${LF_item}\n\t${PZ_item}`
        compare.push(`${x} <i>${invoiceNo}</i> ${boldDiffers(str, dif)}`)
      }
    }
  }
  return compare
}

function removeDuplicates(str1: string, str2: string) {
  const arr1 = (str1 || '').replace(/x[0-9]+x/g, ' $& ').split(/[  ]+/)
  const arr2 = (str2 || '').replace(/x[0-9]+x/g, ' $& ').split(/[  ]+/)
  const set1 = new Set(arr1)
  const set2 = new Set(arr2)
  const uniqueArr1 = arr1.filter((item) => !set2.has(item))
  const uniqueArr2 = arr2.filter((item) => !set1.has(item))
  return [...uniqueArr1, ...uniqueArr2].sort().reverse()
}

function boldDiffers(str: string, dif: string[]) {
  const pattern = `(${dif.join('|').replace(/[.*+?^${}()]/g, '\\$&')})`
  const regex = new RegExp(pattern, 'g')
  return str.replace(regex, '<b>$1</b>')
}

async function extractTextFromPDF(files: FileList) {
  const filesCount = files.length
  const LF: Map<string, string[]> = new Map()
  const PZ: Map<string, string[]> = new Map()
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
    const file = files[fileIndex]
    if (file.type !== 'application/pdf') {
      console.log(`Invalid file type: ${file.type}`, file)
      continue
    }

    const arrayBuffer = await file.arrayBuffer()
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

    if (file.name.match(/LF[0-9]{2} M[0-9]{6}/)) {
      const invoiceNo = getInvoiceNo([file.name]) || `unknown invoice ${unknownInvoiceCounter++}`
      const temp = getProductDetails(gridFile)
      const productsToCompare = getUnifiedProductDetails(temp)
      LF.set(`${invoiceNo}`, productsToCompare)
    }

    if (file.name.match(/[0-9]{2}-PZ [0-9]{4}[A-Z]{2,}/)) {
      const invoiceNo = getInvoiceNo(gridFile) || `unknown invoice ${unknownInvoiceCounter++}`
      const productsToCompare = getUnifiedProductDetails(gridFile)
      PZ.set(`${invoiceNo}`, productsToCompare)
    }
  }
  return { LF: LF, PZ: PZ }
}
</script>

<template>
  <header>
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
      PDF z naszym PZ musi zawierać <b>dokładny numer faktury z LF</b>, oraz ustawione w opcjach
      wydruku <b>kod towaru obok nazwy towaru</b>. Można zaznaczyć i "wgrać" wiele plików
      jednocześnie.
    </p>
  </header>

  <main>
    <div class="button-bar">
      <label for="file-upload" class="button cta">
        <span>Dodaj pliki</span>
      </label>
      <span class="isWorking">{{ isWorking }}</span>
    </div>
    <input
      type="file"
      name="file-upload"
      id="file-upload"
      class="button"
      multiple
      @change="compareFiles"
      hidden
      style="display: none"
    />

    <section>
      <h3 v-if="results && results.length === 0">Wszystko git</h3>
      <label v-if="results" for="valid_items" class="show-valid">
        <input type="checkbox" name="valid_items" id="valid_items" />
        <span>Pokaż prawidłowe</span>
      </label>

      <div
        v-for="item in results"
        :key="item"
        v-html="item"
        :class="{ valid: item.match('✔️'), invalid: item.match('❌') }"
      ></div>
    </section>
  </main>

  <footer>
    <p>Wszelkie prawa zastrzeżone - Paweł Ryszkowski</p>
    <p>
      Uwagi i pomoc techniczna:
      <a href="mailto:pawrys.kontakt@gmail.com?subject=Pomoc%20Tester%20Przyjec" target="_blank"
        >pawrys.kontakt@gmail.com</a
      >
      <span> - </span>
      <a href="https://github.com/PawRys/">Github/PawRys</a>
    </p>
    <p></p>
  </footer>
</template>

<style scoped>
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

div {
  margin-block: 1em;
  white-space: break-spaces;
}

b {
  color: brown;
}
</style>
