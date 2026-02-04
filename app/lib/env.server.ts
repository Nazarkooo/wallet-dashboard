import { validateEnv, env } from './env'

if (typeof window === 'undefined') {
  validateEnv()
}

export { env }
