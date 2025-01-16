<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.min.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { charMap, getProductDetails } from '@/scripts/shared_functions'

const correctText = (input: string): string => {
  return input
    .split('')
    .map((char) => charMap[char] || char) // Zamiana znaku, jeśli istnieje w mapie
    .join('')
}

async function addItemsFromFiles(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  const pdfFiles = target.files as FileList
  const textFiles = await extractTextFromPDF(pdfFiles)
  console.log(textFiles)
  // const usefullData = filterUselessData(textFiles);
  // const dataToDisplay = buildDataToDisplay(usefullData);
}

async function extractTextFromPDF(files: FileList): Promise<Map<string, string[]>> {
  const filesCount = files.length
  const result: Map<string, string[]> = new Map()
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
      result.set(file.name, getProductDetails(gridFile))
    }

    if (file.name.match(/[0-9]{2}-PZ [0-9]{4}[A-Z]{2,}/)) {
      result.set(file.name, gridFile)
    }
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
      class="button"
      multiple
      @change="addItemsFromFiles"
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
