import { getMxcUrl } from "@/lib/utils"

export function Avatar({
  url,
  name,
}: {
  url: string | undefined
  name: string
}) {
  return (
    <div className="flex items-center justify-center h-6 rounded-full shrink-0 aspect-square bg-primary overflow-clip">
      {url ? (
        <img className="" src={getMxcUrl(url)} alt={name} />
      ) : (
        <span className="w-full font-medium text-center text-primarydark">
          {(name && name[0]) || ""}
        </span>
      )}
    </div>
  )
}
