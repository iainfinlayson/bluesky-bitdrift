// logger/bitdrift/setup/index.ts
import {init, SessionStrategy} from '@bitdrift/react-native'
import {Statsig} from 'statsig-react-native-expo'

import {initPromise} from '#/lib/statsig/statsig'
import {
  BITDRIFT_API_KEY,
  BITDRIFT_API_URL,
  ENABLE_BITDRIFT,
  ENABLE_BITDRIFT_NETWORKING,
} from '#/env'

/**
 * Init precedence:
 * 1) Env overrides (ENABLE_BITDRIFT*, BITDRIFT_API_URL) for local/dev.
 * 2) Statsig gates (enable_bitdrift_v2, enable_bitdrift_v2_networking).
 * 3) Default ingest URL falls back to Bluesky’s prod endpoint.
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

  if (isEnabled && BITDRIFT_API_KEY) {
    init(BITDRIFT_API_KEY, SessionStrategy.Fixed, {
      url: BITDRIFT_API_URL || 'https://api-bsky.bitdrift.io',
      enableNetworkInstrumentation: isNetworkEnabled,
    })
  }
})
