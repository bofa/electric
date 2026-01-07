import { DateTime, DurationObjectUnits } from "luxon";
import { RegionId } from "./region";
import { EnergyId, PowerId, PriceId, Unit } from "./source";

export type Series = {
  id: string,
  unit: Unit,
  region: RegionId,
  type: PriceId | PowerId | EnergyId,
  stepSize: DurationObjectUnits,
  startDate: DateTime,
  endDate?: DateTime,
  data: (number | null)[],
  average: number,
}
