import { registerMicroApps, start } from 'qiankun'
import { microApps } from '../micro/apps.config'

export function startMicroApps() {
  registerMicroApps(microApps, {
    beforeLoad: [app => Promise.resolve(console.log('[qiankun] before load', app.name))],
    beforeMount: [app => Promise.resolve(console.log('[qiankun] before mount', app.name))],
    afterUnmount: [app => Promise.resolve(console.log('[qiankun] after unmount', app.name))],
  })

  start({
    sandbox: true,
    prefetch: false,
  })
}
