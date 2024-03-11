"use server"

import { Client, Room } from "simple-matrix-sdk"
import {
  OrganPageEventMeta,
  OrganLocation,
  organLocation,
  organSpaceType,
  organSpaceTypeValue,
  organPageType,
  organPageTypeValue
} from "./types"

const { MATRIX_BASE_URL, AS_TOKEN, TAG_INDEX } = process.env

const client = new Client(MATRIX_BASE_URL!, AS_TOKEN!, {
  fetch,
  params: { user_id: "@_relay_bot:radical.directory" }
})

export async function createEvent(opts: {
  owner: string
  title: string
  description: string
  meta: OrganPageEventMeta
  // events?: string[] //linked events
  // pages?: string[] //parents
  // tags?: string[] //parents
}) {
  const eventSpace = await client.createRoom({
    creation_content: { type: "m.space" },
    name: opts.title,
    topic: opts.description,
    // visibility: "public", // uncomment on next sms upgrade
    invite: [opts.owner],
    initial_state: [
      {
        type: "m.room.join_rules",
        content: {
          join_rule: "public"
        }
      },
      {
        type: organSpaceType,
        content: {
          type: organSpaceTypeValue.page
        }
      },
      {
        type: organPageType,
        content: {
          type: organPageTypeValue.event
        }
      },
      opts.meta
    ]
  })
  return eventSpace
}

export async function createPage(opts: {
  owner: string
  name: string
  description: string
  location?: OrganLocation
  slug?: string
  // pages?: string[] //linked pages
  // tags?: string[] //parents
  // pinned: string[] //pinned posts or events
}) {
  let initial_state: any[] = [
    {
      type: "m.room.join_rules",
      content: {
        join_rule: "public"
      }
    },
    {
      type: organSpaceType,
      content: organSpaceTypeValue.page
    },
    {
      type: organPageType,
      content: organPageTypeValue.id
    }
  ]

  opts.location &&
    initial_state.push({
      type: organLocation,
      content: opts.location
    })

  const pageSpace = await client.createRoom({
    creation_content: { type: "m.space" },
    name: opts.name,
    topic: opts.description,
    room_alias_name:
      opts.slug || opts.name.trim().toLowerCase().replaceAll(" ", "-"),
    // visibility: "public",
    invite: [opts.owner],
    initial_state: initial_state
  })
  return pageSpace
}