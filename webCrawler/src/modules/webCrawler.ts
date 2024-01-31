import puppeteer from 'puppeteer'
import { IAsistenciaResult } from './types'

// The WebCrawler class uses Puppeteer to scrape data from a website and returns an array of objects
export class WebCrawler {
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

      await page.goto(this.asistenciaUrl, { waitUntil: 'networkidle0' })

      await page.waitForSelector('table')

      // Press a select with name congreso_asistencias_length and select vale -1
      await page.select('select[name=congreso_asistencias_length]', '-1')

      const data = await page.evaluate(() => {
        // Search by table id = congreso_asistencias
        const trs = Array.from(document.querySelectorAll('table#congreso_asistencias tbody tr'))

        // From each tr extract td as [type, number, description and link] in an objects array
        return trs.map((tr) => {
          const [type, number, description, link] = Array.from(tr.querySelectorAll('td'))
          const [desc, phase, dateEl] = description.textContent?.split(',') ?? []
          const [_, date, time] = dateEl?.trim()?.split(' ') ?? []
          const url = link.querySelector('a')?.href ?? ''
          const [code] = url?.split('/').reverse() ?? []

          return {
            type: type.textContent ?? '',
            number: number.textContent ?? '',
            description: `${desc}, ${phase}`.trim() ?? '',
            dateTime: `${date} ${time}`.trim() ?? '',
            url,
            code,
          }
        })
      })

      await browser.close()

      return data
    } catch (error: any) {
      throw new Error(error)
    }
  }
}
