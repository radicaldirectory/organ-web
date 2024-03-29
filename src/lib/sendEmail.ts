"use server"

const { MATRIX_BASE_URL, AS_TOKEN, SENDGRID_API_KEY, SERVER_NAME } = process.env

import { Client, Room } from "simple-matrix-sdk"
import { getHmac32 } from "./getHmac"
import { storeSecretInRoom } from "./roomSecretStore"
import { organRoomSecretEmail } from "./types"

async function sendEmailSendgrid(
  to: string,
  from: string,
  subject: string,
  htmlContent: string,
  plaintextContent: string
): Promise<void> {
  const url = "https://api.sendgrid.com/v3/mail/send"

  const headers = {
    Authorization: `Bearer ${SENDGRID_API_KEY}`,
    "Content-Type": "application/json",
  }

  const emailData = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject: subject,
    content: [{ type: "text/html", value: htmlContent }],
  }

  // console.log("emailData", emailData)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`)
    }

    console.log("Email sent successfully")
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}

export async function getOrCreateMailboxId(email: string, username?: string) {
  const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
    params: {
      user_id: "@_relay_bot:" + SERVER_NAME,
    },
    fetch,
  })

  const hash = getHmac32(email)
  console.log("hash", hash)

  const roomIfExists = await client.getRoomIdFromAlias(
    `%23relay_${hash}%3A${SERVER_NAME}`
  )

  console.log("roomIfExists", roomIfExists)

  if (roomIfExists) return roomIfExists

  const room = await client.createRoom({
    name: `${username || hash} Mailbox`,
    invite: ["@email:radical.directory", "@meri:radical.directory"],
    room_alias_name: `relay_${hash}`,
  })

  if ("errcode" in room) {
    console.error("Couldn't create room", room)
    throw new Error("No room_id in response")
  }

  if (username) {
    const aliasUsernameResponse = await room.setAlias(
      `%23relay_${username}%3A${SERVER_NAME}`
    )
  }
  const stored = await storeSecretInRoom(
    room.roomId as string,
    organRoomSecretEmail,
    email
  )
  console.log("stored", stored)

  const readableMailboxName = email.replaceAll("@", ".")

  const createMailboxResponse = await room.sendMessage({
    msgtype: "m.text",
    body: "!pm mailbox " + (username || readableMailboxName),
  })

  return room
}

// const getRoomIdFromAlias = await sendEmail(
//   email,
//   "test email",
//   "here is a test email"
// )

// console.log("room id from alias", getRoomIdFromAlias)

// return JSON.stringify(getRoomIdFromAlias)

export async function sendEmail(
  email: string,
  subject: string,
  htmlContent: string,
  plaintextContent: string
) {
  console.log("email", email, "subject", subject, "body", htmlContent)

  const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
    params: {
      user_id: "@_relay_bot:" + SERVER_NAME,
    },
    fetch,
  })

  const hash = getHmac32(email)

  const roomId = await client.getRoomIdFromAlias(
    `%23relay_${hash}%3A${SERVER_NAME}`
  )

  if (!roomId || (typeof roomId === "object" && "errcode" in roomId))
    return "No room found"

  const room = new Room(roomId, client)

  // if (isSensitive(email)) {
  //send using sendgrid
  sendEmailSendgrid(
    email,
    "notifications@matrix.radical.directory",
    subject,
    htmlContent,
    plaintextContent
  )

  room.sendMessage({
    msgtype: "m.text",
    body:
      "sent using sendgrid to " + email + "\n" + subject + "\n" + htmlContent,
  })
  return
  // }

  // room.sendMessage({
  //   msgtype: "m.text",
  //   body: "!pm send " + email + "\n" + subject + "\n" + htmlContent,
  // })

  // return roomId
}

export async function sendEmailFromMailbox(
  alias: string,
  email: string,
  subject: string,
  htmlContent: string,
  plaintextContent: string
) {
  const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
    params: {
      user_id: "@_relay_bot:" + SERVER_NAME,
    },
    fetch,
  })

  const roomId = await client.getRoomIdFromAlias(`%23${alias}%3A${SERVER_NAME}`)

  if (!roomId || (typeof roomId === "object" && "errcode" in roomId))
    return "No room found"

  const room = new Room(roomId, client)

  // if (isSensitive(email)) {
  sendEmailSendgrid(
    email,
    "notifications@matrix.radical.directory",
    subject,
    htmlContent,
    plaintextContent
  )

  room.sendMessage({
    msgtype: "m.text",
    body: "sent using sendgrid to " + email + "\n" + subject,
  })
  return
  // }

  // const eventId = await room.sendMessage({
  //   msgtype: "m.text",
  //   body: "!pm send " + email + "\n" + subject + "\n" + htmlContent,
  // })

  // return eventId
}

function isSensitive(email: string) {
  return email.includes("@gmail.com") || email.includes("@hotmail.com")
}
