describe('ng-async-injector-app', () => {
  beforeEach(() => cy.visit('/'));

  it('should provide all async providers', () => {
    cy.contains('Provided with useAsyncValue');
    cy.contains('Provided with useAsyncFactory');
    cy.contains('Provided with useAsyncClass');
    cy.contains('Resolved through directive with key');
    cy.contains('Resolved through directive with implicit context');
    cy.contains('Registered in child route');
    cy.contains('Resolved through injection context resolve');
  });
});
