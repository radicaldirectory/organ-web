import LoginLogout from "@/components/ui/LoginLogout"
import { CreatePageAccount } from "./CreatePageAccount"

export function Footer() {
  return (
    <section className="w-full mt-24 text-sm leading-tight">
      <div className="flex items-center gap-2 my-4">
        <LoginLogout />
        <CreatePageAccount />
      </div>

      <P className="my-4">
        organ is a project by{" "}
        <a href="https://radical.directory">Radical Directory</a>
      </P>

      <P>
        chat with us on{" "}
        <a href="https://matrix.org" className="underline">
          matrix
        </a>
        :{" "}
        <a
          className="underline"
          href="https://matrix.to/#/#r.d:radical.directory">
          #r.d:radical.directory
        </a>
      </P>
      <P>
        email{" "}
        <a className="underline" href="mailto:radicaldirectory@protonmail.com">
          radicaldirectory@protonmail.com
        </a>
      </P>
      <P>
        contribute code/ideas on{" "}
        <a className="underline" href="https://github.com/radicaldirectory">
          github
        </a>
      </P>
      {/* <P className="my-4">
        <a href="http://enlacezapatista.ezln.org.mx/wp-content/uploads/2018/08/Manifiesto_Borrador-Final.pdf">
          &ldquo;for a world in which many worlds fit&rdquo;
        </a>
      </P> */}
      <P className="my-4">made on unceded Wurundjeri land</P>
    </section>
  )
}

function P({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <p className={`${className} opacity-60`}>{children}</p>
}
