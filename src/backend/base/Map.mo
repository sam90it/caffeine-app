module {
  public type Map<K, V> = { get : K -> ?V; put : (K, V) -> () };
  public func Map<K, V>(eq : (K, K) -> Bool, hash : K -> Int) : Map<K, V> {
    { get = func(_) { null }; put = func(_, _) { () } };
  };
}