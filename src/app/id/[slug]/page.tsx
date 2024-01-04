/* eslint-disable @next/next/no-img-element */
const { MATRIX_BASE_URL, AS_TOKEN } = process.env

// export const dynamic = "force-dynamic"

import { Room, Client, Event } from "simple-matrix-sdk"
import { getMessagesChunk, noCacheFetch } from "@/lib/utils"
import { Contact } from "@/components/ui/Contact"
import { fetchContactKVs } from "@/lib/fetchContactKVs"
import { IconSettings } from "@tabler/icons-react"
import Link from "next/link"
import { IfModerator } from "@/components/IfModerator"
import { NewPost } from "@/components/ui"
import {
  OrganPostUnstableSchema,
  OrganCalEventUnstableSchema,
} from "@/lib/types"
import { Posts } from "@/components/ui/Posts"
import { Suspense } from "react"
import { FollowButton } from "@/components/ui/FollowButton"
import { deleteOldEdits } from "@/lib/deleteOldEdits"
import { is, object, string } from "valibot"

export default async function OrgSlugPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const roomId = `!${slug}:radical.directory`

  const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
    fetch: noCacheFetch,
    params: {
      user_id: "@_relay_bot:radical.directory",
    },
  })

  const room = new Room(roomId, client)

  console.log(await room.getName())

  const messagesIterator = room.getMessagesAsyncGenerator()
  const messagesChunk: Event[] = await getMessagesChunk(messagesIterator)
  const messages = messagesChunk.filter(
    message => message.type === "m.room.message"
  )

  const posts = messages.filter(
    message =>
      is(OrganPostUnstableSchema, message.content) ||
      is(OrganCalEventUnstableSchema, message.content)
  )

  const freshPosts = deleteOldEdits(posts)

  const avatar = messagesChunk.find(
    (message: Event) => message.type === "m.room.avatar"
  )
  const imageUri: string | undefined = is(
    object({ url: string() }),
    avatar?.content
  )
    ? avatar.content.url
    : undefined
  const serverName = imageUri && imageUri.split("://")[1].split("/")[0]
  const mediaId = imageUri && imageUri.split("://")[1].split("/")[1]
  const avatarUrl =
    serverName && mediaId
      ? `https://matrix.radical.directory/_matrix/media/r0/download/${serverName}/${mediaId}`
      : undefined
  const contactKVs = await fetchContactKVs(room)
  const topic = messagesChunk.find(message => message.type === "m.room.topic")

  // console.log("messages", messages)
  // console.log("posts", posts)

  return (
    <>
      <div className="flex justify-end gap-2 items-center w-full">
        <FollowButton slug={slug} />
        <IfModerator slug={slug}>
          <Link
            href={`/id/${slug}/edit`}
            aria-label="Edit Page"
            className="flex p-1 text-xs opacity-60 items-center border-0 hover:bg-primary rounded-full">
            <IconSettings size={16} />
          </Link>
        </IfModerator>
      </div>
      <div className={`flex my-6 w-full mb-10 ${avatarUrl && "gap-4"}`}>
        <Suspense fallback={<div>loading...</div>}>
          <AvatarFull url={avatarUrl} />
        </Suspense>
        <div className="flex flex-col gap-2 grow justify-between">
          <div className="flex justify-self-start self-end gap-2 justify-between items-end ml-auto"></div>
          <h2 className="font-bold flex gap-2 w-72 text-3xl lg:text-4xl">
            {room.name?.name}
          </h2>
        </div>
      </div>

      <main className="flex flex-col lg:flex-row-reverse w-full gap-4">
        <section className="lg:w-48 w-full flex flex-col lg:flex-col-reverse justify-start lg:justify-end">
          <p className="py-3 lg:opacity-80 whitespace-pre-line lg:text-xs italic text-sm">
            {is(object({ topic: string() }), topic?.content) &&
              topic.content.topic}
          </p>
          <Contact contactKVs={contactKVs} />
        </section>

        <section className="w-full">
          <Suspense fallback={<div>loading...</div>}>
            <IfModerator slug={slug}>
              <NewPost slug={slug} />
            </IfModerator>
          </Suspense>

          <Posts posts={freshPosts} />
        </section>
      </main>
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const roomId = `!${slug}:radical.directory`

  const room = new Room(
    roomId,
    new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
      params: {
        user_id: "@_relay_bot:radical.directory",
      },
      fetch,
    })
  )
  console.log(await room.getName())
  const messagesIterator = await room.getMessagesAsyncGenerator()
  const messagesChunk: Event[] = await getMessagesChunk(messagesIterator)
  const topic = messagesChunk?.find(message => message.type === "m.room.topic")

  return {
    title: room.name?.name,
    description:
      is(object({ topic: string() }), topic?.content) && topic.content.topic,
  }
}

function AvatarFull({ url }: { url: string | undefined }) {
  return (
    <div className="relative">
      <div
        className={`absolute w-full h-full ${
          url ? "bg-transparent" : "bg-[#1D170C33]"
        }`}
      />
      {url && (
        <img src={url} alt="avatar" className="w-20 lg:w-40 opacity-100" />
      )}
    </div>
  )
}
