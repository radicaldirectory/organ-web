const { MATRIX_BASE_URL, AS_TOKEN } = process.env

import { getContextualDate } from "@/lib/utils"
import Link from "next/link"
import { EditMenu } from "@/components/ui/EditMenu"
import { IfLoggedIn } from "@/components/IfLoggedIn"
import { Avatar } from "@/components/ui/Avatar"
import { Client, Room } from "simple-matrix-sdk"

export async function Post({
  content,
  timestamp,
  id,
  slug,
}: {
  content: any
  timestamp: number
  id: string
  slug: string
}) {
  // console.log("post content", content)
  const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
    fetch,
    params: {
      user_id: "@_relay_bot:radical.directory",
    },
  })
  const room = new Room(`!${slug}:radical.directory`, client)
  const avatarUrl = await room.getAvatarMxc()
  return (
    <article className="flex flex-col items-start p-2 pb-4 mt-6 border rounded-lg">
      <div className="flex items-center w-full gap-2">
        <Link className="flex items-center gap-2" href={`/id/${slug}` || ""}>
          {content?.author && (
            <>
              <Avatar url={avatarUrl} name={content?.author?.name} />
              <h5 className="flex items-center gap-2 text-sm font-medium">
                {content?.author?.name}
              </h5>
            </>
          )}
          <time className="text-xs uppercase opacity-60 justify-self-start">
            {getContextualDate(timestamp)}
          </time>
        </Link>
        <div className="ml-auto">
          <IfLoggedIn>
            <EditMenu slug={slug} event_id={id} type="post" />
          </IfLoggedIn>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-2 mt-2 mb-1">
        {content && "title" in content && content?.title && (
          <div className="flex items-center gap-2">
            <Link href={`/id/${slug}/post/${id}`}>
              <h4 className="flex gap-2 text-lg font-bold">
                {content && "title" in content && content?.title}
              </h4>
            </Link>
          </div>
        )}
        <p className="whitespace-pre-line">
          {content?.body.slice(0, 400)}
          {content?.body.length > 400 && (
            <>
              ...{" "}
              <Link href={`/id/${slug}/post/${id}`} className="text-[#aa8eff] ">
                more
              </Link>
            </>
          )}
        </p>
      </div>
    </article>
  )
}
