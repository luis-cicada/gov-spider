import { WebCrawler } from './modules/webCrawler'

const main = async () => {
  try {
    const webCrawler = new WebCrawler()

    const asistencias_data = await webCrawler.getAsistenciasCongreso()

    if (asistencias_data) {
      console.log(asistencias_data.length)
    }
  } catch (error: any) {
    throw new Error(error)
  }
}

// Run the main function
main()
