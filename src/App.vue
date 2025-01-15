<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.min.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'

const correctText = (input: string): string => {
  return input
    .split('')
    .map((char) => charMap[char] || char) // Zamiana znaku, jeśli istnieje w mapie
    .join('')
}

const charMap: { [key: string]: string } = {
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

async function addItemsFromFiles(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  const files = target.files as FileList
  console.log(files)

  const extractedData = await extractDataFromPDF(files)
  console.group(extractedData)
  // const usefullData = filterUselessData(extractedData);
  // const dataToDisplay = buildDataToDisplay(usefullData);

  // labelsStore.addItem(...dataToDisplay)
  // target.value = '' /**reset input */

  // console.log('extractedData: ', extractedData);
  // console.log('usefullData: ', usefullData);
  // console.log('dataToDisplay: ', dataToDisplay);
}

async function extractDataFromPDF(files: FileList): Promise<Map<string, string[]>> {
  const filesCount = files.length
  const result: Map<string, string[]> = new Map()
  for (let fileIndex = 0; fileIndex < filesCount; fileIndex++) {
    const file = files[fileIndex]
    if (file.type !== 'application/pdf') {
      console.log(`Invalid file type: ${file.type}`, file)
      continue
    }
    const arrayBuffer = await file.arrayBuffer()

    // const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      // cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
      cMapUrl: 'https://unpkg.com/browse/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: false,
    }).promise
    const pagesCount = pdf.numPages

    const extractedFile: string[] = []
    // Function to ensure the grid has at least y rows and x columns
    const ensureGridSize = (grid: string[][], y: number, x: number): void => {
      // Add rows if needed
      while (grid.length <= y) {
        grid.push([]) // Add an empty row
      }
      // Add columns in the specific row if needed
      while (grid[y].length <= x) {
        grid[y].push('') // Add an empty string for each new column
      }
    }

    const setGridValue = (grid: string[][], y: number, x: number, text: string): void => {
      ensureGridSize(grid, y, x) // Ensure the grid is large enough
      grid[y][x] = text // Set the value
    }

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

      for (let row = 0; row < grid.length; row++) {
        for (let cell = 0; cell < grid[row].length; cell++) {
          if (grid[row][cell].length === 0) {
            grid[row].splice(cell, 1) // Remove the cell
            cell-- // Adjust the index since the array has shifted
          }
        }
        // Remove the row if it becomes empty
        if (grid[row].length === 0) {
          grid.splice(row, 1)
          row-- // Adjust the index since the grid has shifted
        }
      }
      console.log(grid.reverse().map((row) => row.join('')))
    }

    result.set(file.name, extractedFile)
  }
  return result
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
      class=""
      multiple
      @change="addItemsFromFiles"
      hidden
    />
  </main>
</template>

<style scoped></style>
