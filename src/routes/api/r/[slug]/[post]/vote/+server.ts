import { createClerkClient } from "@clerk/backend";
import { CLERK_SECRET_KEY } from "$env/static/private";
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public";
import { db } from "$lib/server/db/index";
import {
  users as usersTable,
  posts as postsTable,
} from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";

const clerkClient = createClerkClient({
  secretKey: CLERK_SECRET_KEY,
  publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY,
});

export async function POST({ url, request }) {
  let slug = url.pathname.split("/")[3];

  let session;

  try {
    session = await clerkClient.authenticateRequest(request);

    if (!session.isSignedIn) {
      return Response.json({ message: "Unauthorized", status: 401 });
    }
  } catch (error) {
    console.log(error);

    return Response.json({
      message: "Internal Server Error",
      error: error,
      status: 500,
    });
  }

  const { userId } = session.toAuth();
  const body = await request.json();

  let foundUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerk_id, userId!));
  let user;

  if (foundUsers.length === 0) {
    const newUser = await db
      .insert(usersTable)
      .values({
        clerk_id: userId!,
        votes: "{}",
      })
      .returning();

    user = newUser[0];
  } else {
    user = foundUsers[0];
  }

  let foundPosts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id_rand, slug));

  if (foundPosts.length === 0) {
    return Response.json({ message: "Post not found", status: 404 });
  }

  let post = foundPosts[0];
  let votes = JSON.parse(user.votes);

  if (post.id in votes) {
    let old_vote = votes[post.id];
    votes[post.id] = body.vote;

    await db
      .update(usersTable)
      .set({ votes: JSON.stringify(votes) })
      .where(eq(usersTable.id, user.id));

    post.votes = post.votes + body.vote + old_vote * -1;

    await db
      .update(postsTable)
      .set({ votes: post.votes })
      .where(eq(postsTable.id, post.id));
  } else {
    post.votes = post.votes + body.vote;

    await db
      .update(postsTable)
      .set({ votes: post.votes })
      .where(eq(postsTable.id, post.id));

    votes[post.id] = body.vote;

    await db
      .update(usersTable)
      .set({ votes: JSON.stringify(votes) })
      .where(eq(usersTable.id, user.id));
  }
}
