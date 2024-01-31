import { dbClient } from '@gov-spider/libs'
import { WebCrawler } from './modules/webCrawler'

const main = async () => {
  try {
    const webCrawler = new WebCrawler()
    const db = dbClient

    const asistencias_data = await webCrawler.getAsistenciasCongreso()

    const create = await db.prisma.sesiones.createMany({
      data: asistencias_data,
    })

    console.log(create, 'create')
  } catch (error: any) {
    throw new Error(error)
  }
}

// Run the main function
main()
