import clerk from "$lib/server/clerk";
import { db } from "$lib/server/db/index";
import {
  users as usersTable,
  subrabbits as subrabbitsTable,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST({ request }) {
  let body = await request.json();

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
    .where(eq(usersTable.clerk_id, clerk_id));

  if (user.length === 0) {
    user = await db.insert(usersTable).values({ clerk_id }).returning();
  }
  const userId = user[0].id;

  await db.insert(subrabbitsTable).values({
    name: body.name,
    description: body.description,
    owner: userId,
  });

  return Response.json(
    {
      message: "Created",
      url: `/r/${body.name}`,
    },
    { status: 201 },
  );
}
