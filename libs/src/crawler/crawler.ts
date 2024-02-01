import 'dotenv/config'
import puppeteer from 'puppeteer'
import { IAsistenciaResult } from './types'
import { getSessionCode } from './crawler.utils'

// The WebCrawler class uses Puppeteer to scrape data from a website and returns an array of objects
export class WebCrawler {
  private ua: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  private asistenciaUrl: string
  private listadoDeAsistenciasUrl: string

  constructor() {
    if (!process.env.ASISTENCIA_URL) throw new Error('ASISTENCIA_URL environment variable is not defined')
    if (!process.env.LISTADO_ASISTENCIAS_URL) throw new Error('LISTADO_ASISTENCIAS_URL environment variable is not defined')

    this.asistenciaUrl = process.env.ASISTENCIA_URL
    this.listadoDeAsistenciasUrl = process.env.LISTADO_ASISTENCIAS_URL
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

  async getListadoDeAsistencias(type: string, codigo_sesion: string): Promise<any> {
    try {
      // Get the session code
      const asistenciaType = getSessionCode(type)

      // Launch a new browser
      const browser = await puppeteer.launch({ headless: 'new' })
      const page = await browser.newPage()

      await page.setUserAgent(this.ua)

      await page.goto(`${this.listadoDeAsistenciasUrl}/${asistenciaType}/${codigo_sesion}`, { waitUntil: 'domcontentloaded' })

      await page.waitForSelector('table#congreso_asistencias')

      // Press a select with name congreso_asistencias_length and select vale -1
      await page.select('select[name=congreso_asistencias_length]', '-1')

      const data = await page.evaluate(() => {
        // Search by table id = congreso_asistencias
        const trs = Array.from(document.querySelectorAll('table#congreso_asistencias tbody tr'))

        const result = trs.map((tr) => {
          const [name, present, missed, excuse] = Array.from(tr.querySelectorAll('td')) ?? []

          return {
            nombre: name.textContent ?? '',
            presente: (present.textContent ?? '') === 'PRESENTE',
            ausente: (missed.textContent ?? '') !== '--',
            excusa: (excuse.textContent ?? '') !== '--',
          }
        })

        return result
      })

      await browser.close()
    } catch (error: any) {
      throw new Error(error)
    }
  }
}
