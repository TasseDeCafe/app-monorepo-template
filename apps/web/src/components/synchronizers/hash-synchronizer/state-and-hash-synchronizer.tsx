import { StateToHashSynchronizer } from './state-to-hash-synchronizer.tsx'
import { HashToStateSynchronizer } from './hash-to-state-synchronizer.tsx'

export const StateAndHashSynchronizer = () => {
  return (
    <>
      <HashToStateSynchronizer />
      <StateToHashSynchronizer />
    </>
  )
}
