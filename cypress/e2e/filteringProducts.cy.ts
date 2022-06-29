import { CATEGORY } from "cypress/elements/category";
import { FILTERS } from "cypress/elements/filters";
import { NAVIGATION } from "cypress/elements/navigation";
import { filterProducts, waitForProgressBarToNotBeVisible } from "cypress/support/shared";

describe("Filter products", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should filter products by variant attribute SRS_0306", () => {
    waitForProgressBarToNotBeVisible();
    filterProducts(NAVIGATION.categoriesListButtons, CATEGORY.categoryTitle);
    cy.get(FILTERS.filtersMenuButtons).first().click();
    filterProducts(FILTERS.filterList, FILTERS.filterPill);
  });

  it("should clear selected filters SRS_0308", () => {
    waitForProgressBarToNotBeVisible();
    filterProducts(NAVIGATION.categoriesListButtons, CATEGORY.categoryTitle);
    cy.get(FILTERS.filtersMenuButtons).first().click();
    filterProducts(FILTERS.filterList, FILTERS.filterPill);
    cy.get(FILTERS.clearAllFilters)
      .click()
      .get(FILTERS.filterPill)
      .should("not.exist")
      .get(FILTERS.clearAllFilters)
      .should("not.exist");
  });
});
