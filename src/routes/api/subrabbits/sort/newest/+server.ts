import { db } from "$lib/server/db/index";
import { subrabbits } from "$lib/server/db/schema";
import { desc } from "drizzle-orm";

export async function GET({}) {
  let result = await db
    .select()
    .from(subrabbits)
    .orderBy(desc(subrabbits.created_at));

  return Response.json(
    {
      data: result,
    },
    { status: 200 },
  );
}
