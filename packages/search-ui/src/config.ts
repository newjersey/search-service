export type FacetControl = "checkboxGroup";

export interface FacetFieldUIConfig {
  label: string;
  control: FacetControl;
}

export type FacetUIConfig = Record<string, FacetFieldUIConfig>;

export function defineFacetUI(config: FacetUIConfig): FacetUIConfig {
  return config;
}
