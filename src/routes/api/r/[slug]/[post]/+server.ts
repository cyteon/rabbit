import clerk from "$lib/server/clerk.js";
import { db } from "$lib/server/db/index";
import {
  users as usersTable,
  posts as postsTable,
  comments as commentsTable,
  subrabbits as subrabbitsTable,
} from "$lib/server/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function GET({ url, request }) {
  let slug = url.pathname.split("/")[3];
  let postId = url.pathname.split("/")[4];

  var subrabbit = await db
    .select()
    .from(subrabbitsTable)
    .where(eq(subrabbitsTable.name, slug));

  if (subrabbit.length === 0) {
    return Response.json({ message: "404 Not Found" }, { status: 404 });
  }

  let result = await db
    .select()
    .from(postsTable)
    .where(
      and(
        eq(postsTable.id_rand, postId),
        eq(postsTable.subrabbit, subrabbit[0].id),
      ),
    );

  if (result.length === 0) {
    return Response.json({ message: "404 Not Found" }, { status: 404 });
  }

  let comments = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.post, result[0].id))
    .orderBy(desc(commentsTable.created_at));

  return Response.json(
    {
      data: result[0],
      comments: comments,
      subrabbit: subrabbit[0],
    },
    { status: 200 },
  );
}

export async function POST({ url, request }) {
  let session;

  try {
    session = await clerk.authenticateRequest(request);

    if (!session.isSignedIn) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        message: "Internal Server Error",
        error: error,
      },
      { status: 500 },
    );
  }

  let clerk_id = session.toAuth().userId!;

  let body = await request.json();

  let id = Math.random().toString(36).substring(4);

  let foundUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerk_id, clerk_id));
  let user: any;

  if (foundUsers.length === 0) {
    user = await db
      .insert(usersTable)
      .values({ clerk_id: clerk_id })
      .returning();
  } else {
    user = foundUsers[0];
  }

  const insertedComment = await db
    .insert(commentsTable)
    .values({
      id_rand: id,
      post: body.post,
      author: user.id,
      author_clerk_id: clerk_id,
      content: body.content,
    })
    .returning();

  return Response.json(
    {
      message: "Created",
      comment: insertedComment[0],
    },
    { status: 201 },
  );
}
