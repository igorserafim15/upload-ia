import { FastifyInstance } from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: { fileSize: 1_048_576 * 25 },
  })

  app.post('/videos', async (request, response) => {
    const data = await request.file()

    if (!data) {
      return response.status(400).send({ error: 'Missing file input.' })
    }

    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return response
        .status(400)
        .send({ error: 'Invalid input type, please uplad  a MP3.' })
    }

    const fileBaseName = path.basename(data.fieldname, extension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
    const uploadDir = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pump(data.filename, fs.createWriteStream(uploadDir))

    return response.send()
  })
}
