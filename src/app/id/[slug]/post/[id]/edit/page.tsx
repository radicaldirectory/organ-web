"use client"

import { useEffect, useState } from "react"
import { IconNorthStar } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { OrganPostUnstableSchema, organPostUnstable } from "@/lib/types"
import { is } from "valibot"
import Redirect from "@/components/Redirect"
import { useRoom } from "@/hooks/useRoom"
import { IfModerator } from "@/components/IfModerator"

export default function EditPostPage({
  params,
}: {
  params: { slug: string; id: string }
}) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const room = useRoom(params.slug)

  useEffect(() => {
    room
      ?.getEvent(`$${params.id}`)
      .then(post => {
        if (!post) throw new Error("Post not found")
        if (post.type !== "m.room.message") throw new Error("Post not valid")
        if (!is(OrganPostUnstableSchema, post.content))
          throw new Error("Post not valid")

        setTitle(post.content.title || "")
        setContent(post.content.body || "")
        setAuthor(post.content.author || {})
      })
      .catch(e => {
        setError(e)
        return
      })
  }, [room, params.id])

  if (!room) return "loading..."
  if (error) return `error! ${error} :(`

  if (!room)
    return (
      <Redirect redirect="/">
        <div>loading...</div>
      </Redirect>
    )

  async function handlePostSubmit(event: React.FormEvent<HTMLFormElement>) {
    console.log("id", params.id)
    event.preventDefault()
    setIsLoading(true)
    const messageEvent = {
      msgtype: organPostUnstable,
      title,
      body: content,
      author,
      tags: [],
      "m.new_content": {
        body: content,
        msgtype: organPostUnstable,
        title,
        author,
        tags: [],
      },
      "m.relates_to": {
        rel_type: "m.replace",
        event_id: `$${params.id}`,
      },
    }
    //this should EDIT the post, not create a new one
    await room?.sendMessage(messageEvent)
    setIsLoading(false)
    router.push(`/id/${params.slug}/post/${params.id}`)
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value)
  }

  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)
  }

  return (
    <IfModerator slug={params.slug} redirect="/">
      <div className="mt-3 border border-[#1D170C22] rounded p-1 bg-[#fff3] flex flex-col w-full">
        <form onSubmit={handlePostSubmit} className="flex flex-col gap-2">
          <div className="flex gap-1">
            <h3 className="opacity-80 w-36 text-base font-medium flex justify-center items-center gap-1 px-1 pr-2 bg-[#fff9] rounded">
              <IconNorthStar size={16} /> Edit
            </h3>
            <input
              type="text"
              id="title"
              placeholder="Title"
              aria-label="title"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-1 bg-transparent font-medium placeholder:text-black placeholder:opacity-30 border border-[#1D170C1a] rounded"
            />
          </div>
          <div className="flex flex-col">
            <textarea
              id="content"
              aria-label="content"
              placeholder="Content"
              value={content}
              // rows={content.split("\n").length + 1}
              onChange={handleContentChange}
              className={`w-full px-1 text-base placeholder:text-black placeholder:opacity-30 bg-transparent border border-[#1D170C1a] rounded h-[78vh] ${
                isLoading && "opacity-50"
              }`}
            />
          </div>
          <button
            type="submit"
            className={`self-end rounded bg-primary px-2 ${
              isLoading && "opacity-50"
            }`}>
            Save
          </button>
        </form>
      </div>
    </IfModerator>
  )
}
