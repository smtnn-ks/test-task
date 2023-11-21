import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const PORT = process.env.PORT || 6969
  const app = await NestFactory.create(AppModule)
  await app.listen(PORT, () => console.log(`Running on port ${PORT}...`))
}
bootstrap()
