import 'dotenv/config'
import puppeteer from 'puppeteer'
import { IAsistenciaResult } from './types'

// The WebCrawler class uses Puppeteer to scrape data from a website and returns an array of objects
export class WebCrawler {
  private ua: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  private asistenciaUrl: string

  constructor() {
    if (!process.env.ASISTENCIA_URL) throw new Error('ASISTENCIA_URL environment variable is not defined')

    this.asistenciaUrl = process.env.ASISTENCIA_URL
  }

  /**
   * The function `getAsistencias` uses Puppeteer to scrape data from a webpage and returns an array of
   * objects containing information about asistencias.
   * @returns The function `getAsistencias` is returning a Promise that resolves to an array of
   * objects. Each object in the array represents an asistencia (attendance) and contains the following
   * properties:
   */
  async getAsistenciasCongreso(): Promise<IAsistenciaResult[]> {
    try {
      const browser = await puppeteer.launch({ headless: 'new' })
      const page = await browser.newPage()

      await page.setUserAgent(this.ua)

      await page.goto(this.asistenciaUrl, { waitUntil: 'domcontentloaded' })

      await page.waitForSelector('table#congreso_asistencias')

      // Press a select with name congreso_asistencias_length and select vale -1
      await page.select('select[name=congreso_asistencias_length]', '-1')

      const data = await page.evaluate(() => {
        // Search by table id = congreso_asistencias
        const trs = Array.from(document.querySelectorAll('table#congreso_asistencias tbody tr'))

        const result = trs.map((tr) => {
          const [type, number, description, link] = Array.from(tr.querySelectorAll('td')) ?? []
          const [desc, phase, dateEl] = description?.textContent?.split(',') ?? []
          const [_, date, time] = dateEl?.trim()?.split(' ') ?? []
          const url = link?.querySelector('a')?.href ?? ''
          const [codigo_sesion] = url?.split('/').reverse() ?? []

          return {
            tipo: type.textContent ?? '',
            numero: number.textContent ?? '',
            descripcion: `${desc.trim()}, ${phase.trim()}` ?? '',
            fecha: `${date} ${time}`.trim() ?? '',
            status: 'Unprocessed',
            url,
            codigo_sesion,
          }
        })

        return result
      })

      await browser.close()

      return data
    } catch (error: any) {
      throw new Error(error)
    }
  }
}
