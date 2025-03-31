import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ConversationFiltersProps {
  value: string
  onValueChange: (value: string) => void
}

const ConversationFilters = ({ value, onValueChange }: ConversationFiltersProps) => {
  return (
    <Tabs defaultValue={value} className="w-[300px]" onValueChange={onValueChange}>
      <TabsList className="h-9">
        <TabsTrigger value="all">All Conversations</TabsTrigger>
        <TabsTrigger value="open">Open</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default ConversationFilters
