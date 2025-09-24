import {
  defaultStreamHandler,
  defineHandlerCallback,
} from '@tanstack/react-start/server'
import { getRouter } from './router'
import { createClerkHandler } from '@clerk/tanstack-react-start/server'

const handlerFactory = createClerkHandler(getRouter)

export default defineHandlerCallback(async (event) => {
  const startHandler = await handlerFactory(defaultStreamHandler)
  return startHandler(event)
})
