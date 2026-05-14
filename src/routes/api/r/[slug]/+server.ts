import { db } from "$lib/server/db/index";
import {
  users as usersTable,
  posts as postsTable,
  subrabbits as subrabbitsTable,
} from "$lib/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET({ url }) {
  let slug = url.pathname.split("/").pop();

  let result = await db
    .select()
    .from(subrabbitsTable)
    .where(eq(subrabbitsTable.name, slug!));

  if (result.length === 0) {
    return Response.json({ message: "404 Not Found" }, { status: 404 });
  }

  let posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.subrabbit, result[0].id))
    .orderBy(desc(postsTable.votes));

  return Response.json(
    {
      data: result[0],
      posts: posts,
    },
    { status: 200 },
  );
}

export async function POST({ request }) {
  var body = await request.json();

  let result = await db
    .select()
    .from(subrabbitsTable)
    .where(eq(subrabbitsTable.name, body.subrabbit));

  if (result.length === 0) {
    return Response.json({ message: "Subrabbit not found" }, { status: 404 });
  }

  let id = Math.random().toString(36).substring(4);

  let user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerk_id, body.author));

  if (user.length === 0) {
    user = await db
      .insert(usersTable)
      .values({ clerk_id: body.author })
      .returning();
  }

  await db.insert(postsTable).values({
    id_rand: id,
    title: body.title,
    content: body.content,
    subrabbit: result[0].id,
    subrabbit_name: body.subrabbit,
    author: user[0].id,
    author_clerk_id: body.author,
  });

  return Response.json(
    {
      message: "Created",
      url: `/r/${body.subrabbit}/${id}`,
    },
    { status: 201 },
  );
}
