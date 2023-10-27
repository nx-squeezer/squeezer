import { getHeading } from '../support/app.po';

describe('ngx-ssr-app', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getHeading().contains(/Welcome/);
  });
});
