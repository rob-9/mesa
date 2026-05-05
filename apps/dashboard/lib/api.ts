import { fixtureDashboard, fixtureDeliberation } from "./fixtures";
import type { DashboardData, DeliberationDetail } from "./types";

// v1 reads from local fixtures. The eventual fastapi swap is mechanical:
// replace the body of each function with a `fetch()` against the real endpoint.

export async function getDashboard(): Promise<DashboardData> {
  return fixtureDashboard();
}

export async function getDeliberation(id: string): Promise<DeliberationDetail | null> {
  return fixtureDeliberation(id);
}
