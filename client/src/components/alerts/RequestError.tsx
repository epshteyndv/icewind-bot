import {Alert} from "@chakra-ui/react"

export function RequestError(props: Error) {
  return (
    <Alert.Root status="error">
      <Alert.Indicator/>
      <Alert.Content>
        <Alert.Title>Ошибка при выполнении запроса</Alert.Title>
        <Alert.Description>
          {props.message}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  )
}