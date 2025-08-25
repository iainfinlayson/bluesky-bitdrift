// logger/bitdrift/setup/index.ts
import {init, SessionStrategy} from '@bitdrift/react-native'
import {Statsig} from 'statsig-react-native-expo'

import {initPromise} from '#/lib/statsig/statsig'
import {
  BITDRIFT_API_KEY,
  BITDRIFT_API_URL,
  ENABLE_BITDRIFT,
  ENABLE_BITDRIFT_NETWORKING,
  IS_DEV,
} from '#/env'

/**
 * Init precedence:
 * 1) Explicit dev override (always enable logs in dev, networking too).
 * 2) Env overrides (ENABLE_BITDRIFT*, BITDRIFT_API_URL).
 * 3) Statsig gates (enable_bitdrift_v2, enable_bitdrift_v2_networking).
 * 4) Default ingest URL falls back to Bluesky’s prod endpoint.
 *
 * Note: enableNetworkInstrumentation only affects iOS here;
 * Android networking is controlled via the Gradle plugin.
 */
initPromise.then(() => {
  let isEnabled = ENABLE_BITDRIFT
  let isNetworkEnabled = ENABLE_BITDRIFT_NETWORKING

  try {
    if (Statsig.checkGate('enable_bitdrift_v2')) {
      isEnabled = true
    }
    if (Statsig.checkGate('enable_bitdrift_v2_networking')) {
      isNetworkEnabled = true
    }
  } catch {
    // Statsig may not be ready yet; env overrides still apply.
  }

  // ✅ Development override: always enable Bitdrift logs + networking
  if (IS_DEV && BITDRIFT_API_KEY) {
    console.log(
      '[bitdrift] initializing in development mode (logs + networking)',
    )
    init(BITDRIFT_API_KEY, SessionStrategy.Fixed, {
      url: BITDRIFT_API_URL || 'https://api-bsky.bitdrift.io',
      enableNetworkInstrumentation: true,
    })
    return
  }

  // ✅ Production/testflight/other envs
  if (isEnabled && BITDRIFT_API_KEY) {
    console.log('[bitdrift] initializing in production/testflight')
    init(BITDRIFT_API_KEY, SessionStrategy.Fixed, {
      url: BITDRIFT_API_URL || 'https://api-bsky.bitdrift.io',
      enableNetworkInstrumentation: isNetworkEnabled,
    })
  }
})
