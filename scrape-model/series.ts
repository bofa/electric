import { DateTime, DurationObjectUnits } from "luxon";
import { RegionId } from "./region";
import { EnergyId, PowerId, PriceId, Unit } from "./source";

export type Series = {
  unit: Unit,
  region: RegionId,
  type: PriceId | PowerId | EnergyId,
  stepSize: DurationObjectUnits,
  startDate: DateTime,
  endDate?: string,
  data: (number | null)[],
}
