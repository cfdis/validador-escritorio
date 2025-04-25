import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import fs from 'fs-extra'
import path from 'path'

const copyMigrationsPlugin = () => {
  return {
    name: 'copy-migrations',
    apply(config, env) {
      return true // aplica siempre (dev o build)
    },
    async writeBundle() {
      const srcDir = path.resolve(__dirname, 'out/migrations')
      const destDir = path.resolve(__dirname, 'out/main/migrations')

      // try {
      //   await fs.copy(srcDir, destDir, { overwrite: true })
      //   console.log('✅ Migraciones copiadas a:', destDir)
      // } catch (err) {
      //   console.error('❌ Error al copiar migraciones:', err)
      // }
      try {
        // Leer el directorio de origen
        const files = await fs.readdir(srcDir)

        // Filtrar solo los archivos .js
        const jsFiles = files.filter(file => file.endsWith('.js'))

        // Copiar solo los archivos .js
        for (const file of jsFiles) {
          await fs.copy(path.join(srcDir, file), path.join(destDir, file))
        }

        console.log('✅ Migraciones .js copiadas a:', destDir)
      } catch (err) {
        console.error('❌ Error al copiar migraciones:', err)
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(),
    copyMigrationsPlugin()
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    appType: 'mpa',
  }
})
