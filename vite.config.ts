import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const env = globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>
  }
}

const repositoryName = env.process?.env?.GITHUB_REPOSITORY?.split('/')[1]
const isProjectPagesBuild = env.process?.env?.GITHUB_ACTIONS === 'true'
  && repositoryName
  && !repositoryName.endsWith('.github.io')

const base = isProjectPagesBuild
  ? `/${repositoryName}/`
  : '/'

export default defineConfig({
  base,
  plugins: [vue()],
  build: {
    minify: false,
    sourcemap: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
