import { createClerkClient } from "@clerk/backend";
import { db } from "$lib/server/db/index";
import { users as usersTable } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import clerk from "$lib/server/clerk.js";

export async function GET({ url, request, locals }) {
  let slug = url.pathname.split("/").pop()!;

  if (slug == "self") {
    if (!locals.session) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    let user = await clerk.users.getUser(locals.session.userId);

    let data = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, user.id));

    if (data.length === 0) {
      data = await db
        .insert(usersTable)
        .values({ clerk_id: user.id })
        .returning();
    }

    data[0].votes = data[0].votes ? JSON.parse(data[0].votes) : {};

    return Response.json(
      {
        session: locals.session,
        user: user,
        data: data[0],
      },
      { status: 200 },
    );
  }

  if (slug.startsWith("id_")) {
    try {
      slug = slug.slice(3);

      let user = await clerk.users.getUser(slug);

      if (user == null) {
        return Response.json({ message: "User not found" }, { status: 404 });
      }

      let result = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.clerk_id, user.id));

      if (result.length === 0) {
        result = await db
          .insert(usersTable)
          .values({ clerk_id: user.id })
          .returning();
      }

      return Response.json(
        {
          id: user.id,
          banned: user.banned,
          imageUrl: user.imageUrl,
          username: user.username,
          publicMetadata: user.publicMetadata,
          lastActiveAt: user.lastActiveAt,
          createdAt: user.createdAt,
        },
        { status: 200 },
      );
    } catch (error) {
      return new Response(null, { status: 404 });
    }
  }

  let data = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, parseInt(slug)));

  if (data.length === 0) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  let user = await clerk.users.getUser(data[0].clerk_id);

  return Response.json(
    {
      id: user.id,
      banned: user.banned,
      imageUrl: user.imageUrl,
      username: user.username,
      publicMetadata: user.publicMetadata,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
    },
    { status: 200 },
  );
}
