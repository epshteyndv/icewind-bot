import {VStack} from "@chakra-ui/react";
import {useQuery} from "@tanstack/react-query";
import {ArticlesListItem} from "@/features/articles/ArticlesListItem.tsx";
import {articlesApi} from "@/features/articles/api.ts";
import {RequestError} from "@/components/alerts/RequestError.tsx";
import {RequestLoading} from "@/components/progress/RequestLoading.tsx";


export function ArticlesList() {
  const {data, error, isLoading} = useQuery({
    queryKey: ['articles'],
    queryFn: articlesApi.getAll,
  });

  if (isLoading || !data) return <RequestLoading/>
  if (error) return <RequestError {...error} />;

  return (
    <VStack>
      {data.map((item) => (
        <ArticlesListItem key={item.id} item={item}/>
      ))}
    </VStack>
  );
}