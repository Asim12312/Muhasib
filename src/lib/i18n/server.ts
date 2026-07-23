import { cookies } from "next/headers";
import { Lang } from "./strings";

export async function getLangFromCookie(): Promise<Lang> {
  const store = await cookies();
  const c = store.get("mohasib_lang")?.value;
  return c === "ur" ? "ur" : "en";
}
