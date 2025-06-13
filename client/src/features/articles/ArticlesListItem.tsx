import {Card} from "@chakra-ui/react";
import type {Article} from "@/features/articles/api.ts";

export function ArticlesListItem(props: { item: Article }) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title mt="2">
          {props.item.title}
        </Card.Title>
      </Card.Header>

      <Card.Body gap="2">
        <Card.Description whiteSpace="pre-line">
          {props.item.content}
        </Card.Description>
      </Card.Body>
    </Card.Root>
  )
}