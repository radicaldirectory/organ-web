import { Room, Event } from "simple-matrix-sdk"
import { getMessagesChunk } from "@/lib/utils"
import { is, object, string } from "valibot"

export async function Org({ room }: { room: Room }) {
  const messagesIterator = await room.getMessagesAsyncGenerator()
  const messagesChunk: Event[] = await getMessagesChunk(messagesIterator)
  // const messageTypes = messagesChunk.map(message => message.type)
  const topic = messagesChunk.find(message => message.type === "m.room.topic")
  // console.log("topic", topic)
  return (
    <div className="h-24 py-2 my-2 border-[#1D170C33] rounded overflow-clip">
      <h2 className="text-base">{room.name?.name}</h2>
      <p className="text-sm italic text-stone-600 line-clamp-3">
        {is(object({ topic: string() }), topic?.content) &&
          topic.content.topic.slice(0, 300)}
      </p>
    </div>
  )
}
