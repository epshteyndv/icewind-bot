import {Center, ProgressCircle} from "@chakra-ui/react"

export function RequestLoading() {
  return (
    <Center>
      <ProgressCircle.Root value={null} size="sm">
        <ProgressCircle.Circle>
          <ProgressCircle.Track/>
          <ProgressCircle.Range/>
        </ProgressCircle.Circle>
      </ProgressCircle.Root>
    </Center>
  )
}