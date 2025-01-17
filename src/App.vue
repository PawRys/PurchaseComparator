<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.min.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { charMap, getProductDetails, getUnifiedProductDetails } from '@/scripts/shared_functions'

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
  const target = event.target as HTMLInputElement
  const pdfFiles = target.files as FileList
  const textFiles = await extractTextFromPDF(pdfFiles)
  // console.log(textFiles)
  const compared = compareTextFiles(textFiles)
  console.log(compared)
}

function compareTextFiles(textFiles: {
  invoice: Map<string, string[]>
  PZ: Map<string, string[]>
}) {
  const compare = []
  for (const [invoiceNo, products] of textFiles.invoice) {
    const LF = textFiles.invoice.get(invoiceNo) || []
    const PZ = textFiles.PZ.get(invoiceNo) || []

    for (let index = 0; index < products.length; index++) {
      let x = '✔️'
      if (LF[index] !== PZ[index]) x = '❌'
      compare.push(`${x} ${invoiceNo} -- ${LF[index]} / ${PZ[index]}`)
    }
  }
  return compare
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
  return { invoice: LF, PZ: PZ }
}
</script>

<template>
  <header></header>

  <main>
    <div class="button-bar"><label for="file-upload" class="button cta">Dodaj pliki</label></div>
    <input
      type="file"
      name="file-upload"
      id="file-upload"
      class="button"
      multiple
      @change="compareFiles"
      hidden
    />
  </main>
</template>

<style scoped>
.button {
  background-color: steelblue;
  color: white;
  padding: 5px 8px;
  border-radius: 5px;
}
</style>
