/* eslint-disable sonarjs/no-duplicate-string */
describe('ngx-forms-app', () => {
  beforeEach(() => cy.visit('/'));

  it('lazy validator using a directive', () => {
    cy.contains('Invalid directive').should('not.exist');

    cy.get('input').eq(0).as('directiveInput');
    cy.get('@directiveInput').focus();
    cy.get('@directiveInput').clear();
    cy.get('@directiveInput').type('invalid');

    cy.contains('Invalid directive').should('exist');
  });

  it('lazy validator using lazyValidator function', () => {
    cy.contains('Invalid lazy').should('not.exist');

    cy.get('input').eq(1).as('lazyValidatorInput');
    cy.get('@lazyValidatorInput').focus();
    cy.get('@lazyValidatorInput').clear();
    cy.get('@lazyValidatorInput').type('invalid');

    cy.contains('Invalid lazy').should('exist');
  });
});
