import type { GuardianRelationship } from "./guardian.types";

export interface CatalogOption<T extends string = string> {
  value: T;
  label: string;
}

export type GuardianRelationshipOption =
  CatalogOption<GuardianRelationship>;