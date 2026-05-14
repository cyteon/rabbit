import { db } from "$lib/server/db/index";
import {
  users as usersTable,
  subrabbits as subrabbitsTable,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST({ request }) {
  let body = await request.json();

  let result = await db
    .select()
    .from(subrabbitsTable)
    .where(eq(subrabbitsTable.name, body.name));

  if (result.length > 0) {
    return Response.json(
      {
        message: "Subrabbit already exists",
      },
      { status: 409 },
    );
  }

  let user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerk_id, body.owner));
  if (user.length === 0) {
    user = await db
      .insert(usersTable)
      .values({ clerk_id: body.owner })
      .returning();
  }
  const userId = user[0].id;

  await db.insert(subrabbitsTable).values({
    name: body.name,
    description: body.description,
    owner: userId,
  });

  var subrabbit = {
    name: body.name,
    description: body.description,
    owner: body.owner,
  };

  return Response.json(
    {
      message: "Created",
      url: `/r/${body.name}`,
    },
    { status: 201 },
  );
}
