import { WebCrawler, dbClient } from '@gov-spider/libs'

const main = async () => {
  try {
    const webCrawler = new WebCrawler()
    const db = dbClient

    const asistencias_data = await webCrawler.getAsistenciasCongreso()

    const create = await db.prisma.sesiones.createMany({
      data: asistencias_data,
    })

    if (!create) {
      throw new Error('Error creating data')
    }
  } catch (error: any) {
    throw new Error(error)
  }
}

// Run the main function
main()
