import { Client } from "@/models/Client";
import { Session, clientScope } from "@/lib/access";

/** Ids of every SME client the session may see — for cross-client queries. */
export async function visibleClientIds(s: Session) {
  const rows = await Client.find(clientScope(s)).select("_id");
  return rows.map((r) => r._id);
}
