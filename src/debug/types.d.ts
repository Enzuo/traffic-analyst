import type { createPerformanceGraph } from './performance/PerformanceGraph'
import type { createPerformanceObserver } from './performance/PerformanceObserver'

declare global {
  type PerformanceOb = ReturnType<typeof createPerformanceObserver>
  type PerformanceGraph = ReturnType<typeof createPerformanceGraph>
}
