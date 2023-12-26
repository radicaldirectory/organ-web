import { getContextualDate } from "@/lib/utils"
import Link from "next/link"
import { PostEditMenu } from "@/components/ui/PostEditMenu"
import { IfLoggedIn } from "@/components/IfLoggedIn"
import { Avatar } from "@/components/ui/Avatar"

export function Post({
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
  console.log("post content", content)
  return (
    <article className="mt-6  pb-4 flex flex-col items-start">
      <div className="flex items-center gap-2 w-full">
        <Link
          className="flex items-center gap-2"
          href={`/id/${slug}/post/${id}` || ""}>
          {content?.author && (
            <>
              <Avatar
                url={content?.author?.avatar_url}
                name={content?.author?.name}
              />
              <h5 className="text-sm flex items-center font-medium gap-2">
                {content?.author?.name}
              </h5>
            </>
          )}
          <time className="opacity-60 text-xs justify-self-start uppercase">
            {getContextualDate(timestamp)}
          </time>
        </Link>
        <div className="ml-auto">
          <IfLoggedIn>
            <PostEditMenu slug={slug} event_id={id} />
          </IfLoggedIn>
        </div>
      </div>
      <div className="flex flex-col p-2 mt-2 justify-between gap-2 mb-1 ml-2 border rounded-lg">
        {content && "title" in content && content?.title && (
          <div className="flex items-center gap-2">
            <Link href={`/id/${slug}/post/${id.split("$")[1]}`}>
              <h4 className="text-lg font-bold flex gap-2">
                {content && "title" in content && content?.title}
              </h4>
            </Link>
          </div>
        )}
        <p className="whitespace-pre-line">{content?.body}</p>
      </div>
    </article>
  )
}
