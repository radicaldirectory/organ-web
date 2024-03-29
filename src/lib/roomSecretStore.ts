"use server"

import { Client, ErrorOutput, Room } from "simple-matrix-sdk"
import { noCacheFetch } from "./utils"

const { MATRIX_BASE_URL, AS_TOKEN, SERVER_NAME } = process.env

export async function storeSecretInRoom(
  roomId: string,
  key: string,
  value: string
) {
  const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
    params: {
      user_id: "@_relay_bot:" + SERVER_NAME,
    },
    fetch,
  })

  const room = new Room(roomId, client)

  const eventId = await room.sendEvent("organ.secret", {
    body: value,
  })

  const stateEventId = await room.sendStateEvent("organ.secretId", eventId, key)

  console.log("stateEventId", stateEventId)

  return { stateEventId, eventId }
}

export async function getSecretFromRoom(
  roomId: string,
  key: string
): Promise<{ body: string } | ErrorOutput> {
  const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
    params: {
      user_id: "@_relay_bot:" + SERVER_NAME,
    },
    fetch: noCacheFetch,
  })

  const room = new Room(roomId, client)

  console.log(roomId, " with ", key)

  const stateEventId = await room.getStateEvent("organ.secretId", key)

  console.log(roomId, " --> ", stateEventId)

  if (!stateEventId || "errcode" in stateEventId)
    return stateEventId as ErrorOutput

  const message = await room.getEvent(stateEventId.event_id)
  if ("errcode" in message) return message as ErrorOutput

  return message?.content as { body: string }
}
