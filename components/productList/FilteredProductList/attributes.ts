import { AttributeFilterFragment } from "@/saleor/api";

import { FilterPill } from "./FilterPills";

export interface UrlFilter {
  slug: string;
  values: string[];
}

export const getPillsData = (f: UrlFilter[], attributeFiltersData: AttributeFilterFragment[]) => {
  const pills: FilterPill[] = [];
  for (const filter of f) {
    const choiceAttribute = attributeFiltersData.find((a) => a.slug === filter.slug);
    const attrName = choiceAttribute ? choiceAttribute.name : filter.slug;
    for (const value of filter.values) {
      let choiceName = value;
      if (choiceAttribute) {
        const attrChoice = choiceAttribute.choices?.edges.find((ch) => ch.node.slug === value);
        if (attrChoice?.node.name) {
          choiceName = attrChoice.node.name;
        }
      }
      pills.push({
        label: `${attrName}: ${choiceName}`,
        choiceSlug: value,
        attributeSlug: filter.slug,
      });
    }
  }
  return pills;
};

export const parseQueryAttributeFilters = (query: string): UrlFilter[] => {
  const filters: UrlFilter[] = [];
  query.split(";").map((a) => {
    const splitted = a.split(".");
    const x = { slug: splitted[0], values: splitted.slice(1) };
    if (x.values.length > 0) {
      filters.push(x);
    }
  });
  return filters;
};

export const serializeQueryAttributeFilters = (value: UrlFilter[]): string =>
  value.map((v) => [v.slug, ...v.values].join(".")).join(";");
