"use client"

import { useState } from "react"
import { useClient } from "@/hooks/useClient"
import { Input, Button, Textarea } from "@/components/styled"
// import { EditableContacts } from "../[slug]/edit/EditableContactSection"
import {
  ContactType,
  contactTypes,
  organMetaContactUnstable,
  organPageType,
  organPageTypeValue,
  organRoomType,
  organSpaceType,
  organSpaceTypeValue,
} from "@/lib/types"
import { useRouter } from "next/navigation"
import { is } from "valibot"
import { ErrorSchema } from "simple-matrix-sdk"
import { ErrorBox } from "@/components/ui/ErrorBox"
import { slug } from "@/lib/utils"
import { IconNorthStar } from "@tabler/icons-react"
import { joinRoom } from "@/app/api/join/action"

const NewRoomPage = () => {
  const client = useClient()

  const router = useRouter()

  const [name, setName] = useState("")
  const [topic, setTopic] = useState("")
  const [contactKVs, setContactKVs] = useState<
    Record<string, string | undefined>
  >({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // function setContactKV(contactType: ContactType, contactValue?: string) {
  //   // console.log("setting contact kv", contactType, contactValue)
  //   setContactKVs({ ...contactKVs, [contactType]: contactValue })
  // }
  // function removeContactKV(contactType: ContactType) {
  //   const { [contactType]: _, ...rest } = contactKVs
  //   setContactKVs(rest)
  // }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }

  const handleTopicChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log("Creating new room...")
    try {
      const room = await client?.createRoom({
        name,
        topic,
        creation_content: {
          type: "m.space",
        },
        initial_state: [
          {
            type: "m.room.power_levels",
            state_key: "",
            content: {
              ban: 50,
              events: {
                "m.room.name": 100,
                "m.room.power_levels": 100,
              },
              events_default: 0,
              invite: 50,
              kick: 50,
              notifications: {
                room: 20,
              },
              redact: 50,
              state_default: 50,
              users: {
                "@_relay_bot:radical.directory": 100,
                [client.userId]: 100,
              },
              users_default: 0,
            },
          },
          {
            type: organSpaceType,
            state_key: "",
            content: {
              type: organSpaceTypeValue.page,
            },
          },
          {
            type: organPageType,
            state_key: "",
            content: {
              type: organRoomType,
              value: "id",
            },
          },
        ],
        invite: [`@_relay_bot:${process.env.NEXT_PUBLIC_SERVER_NAME}`],
      })
      if (!room) throw new Error("Failed to create room")
      console.log("Room creation result:", room)
      if (is(ErrorSchema, room)) throw new Error(room.error)

      const join = await joinRoom(room.roomId, "bot")
      console.log("join", join)

      router.push(`/id/${slug(room?.roomId)}`)
    } catch (error) {
      console.error(error)
      const strErr =
        (typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string" &&
          error.message) ||
        ""
      setError(strErr)
      return
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="flex items-center gap-2 text-2xl font-medium">
        <IconNorthStar size={24} /> New Group
      </h2>
      <p>
        Create a public profile for organisations, collectives, or other groups.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="name">Name</label>
        <Input
          name="name"
          type="text"
          value={name}
          onChange={handleNameChange}
        />
        <br />
        <label htmlFor="description">About</label>
        <Textarea
          name="description"
          value={topic}
          onChange={handleTopicChange}
        />
        <br />

        <ErrorBox error={error} />

        {/* <br />
        <label>
          Contacts:{" "}
          <EditableContacts
            {...{ contactKVs, setContactKV, removeContactKV }}
          />
        </label> */}

        <br />
        <Button type="submit" className="self-start border border-black">
          Create Page
        </Button>
      </form>
    </div>
  )
}

export default NewRoomPage
