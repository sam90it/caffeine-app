module {
  public func equal(t1 : Text, t2 : Text) : Bool {
    t1 == t2
  };
  public func hash(t : Text) : Int {
    // Simple hash for local dev
    0
  };
}