import { db } from "$lib/server/db/index";
import { posts as postsSchema } from "$lib/server/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET({ url }) {
  let slug = url.pathname.split("/").pop();

  var posts;

  switch (slug) {
    case "top":
      posts = await db
        .select()
        .from(postsSchema)
        .orderBy(desc(postsSchema.votes));
      break;
    case "new":
      posts = await db
        .select()
        .from(postsSchema)
        .orderBy(desc(postsSchema.created_at));
      break;
    case "old":
      posts = await db
        .select()
        .from(postsSchema)
        .orderBy(postsSchema.created_at);
      break;
    case "random":
      posts = await db
        .select()
        .from(postsSchema)
        .orderBy(sql`RANDOM()`);
      break;
  }

  return Response.json(
    {
      posts: posts,
    },
    { status: 200 },
  );
}
