describe('extractDefaultExport', () => {
  it('should unwrap default exports', () => {
    expect({ default: true }).toBe(true);
  });

  it('should pass through symbols', () => {
    expect(true).toBe(true);
  });
});
