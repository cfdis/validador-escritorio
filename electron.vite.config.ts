import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import fs from 'fs-extra'
import path from 'path'

const copyMigrationsPlugin = () => {
  return {
    name: 'copy-migrations',
    apply(_: any, __: any) {
      return true // aplica siempre (dev o build)
    },
    async writeBundle() {
      const srcDir = path.resolve(__dirname, 'out/migrations')
      const destDir = path.resolve(__dirname, 'out/main/migrations')
      try {
        const files = await fs.readdir(srcDir)
        const jsFiles = files.filter(file => file.endsWith('.js'))
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

function copyViewsPlugin() {
  return {
    name: 'copy-views-plugin',
    apply(_: any, __: any) {
      return true // aplica siempre (dev o build)
    },
    generateBundle() {
      const srcDir = path.resolve(__dirname, 'src/renderer/views');
      const destDir = path.resolve(__dirname, 'out/renderer/views');
      fs.copySync(srcDir, destDir);
      console.log('✅ Vistas copiadas en buildStart:', destDir);
    }
  };
}

function copyPdfDistPlugin() {
  return {
    name: 'copy-pdf-dist-plugin',
    apply(_: any, __: any) {
      return true
    },
    generateBundle() {
      const srcDir = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
      const destDir = path.resolve(__dirname, 'out/renderer/assets/pdf.worker.min.mjs');
      fs.copySync(srcDir, destDir);
      console.log('✅ Pdf Worker copiado:', destDir);
    }
  };
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
    plugins: [
      copyViewsPlugin(),
      copyPdfDistPlugin(),
      // viteStaticCopy({
      //   targets: [
      //     {
      //       src: 'src/../views/*',   // De dónde copiar (en desarrollo)
      //       dest: 'views/'                // A dónde copiar en out/renderer
      //     }
      //   ]
      // })
    ]
  }
})
