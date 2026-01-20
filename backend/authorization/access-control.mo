import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public type UserRole = {#admin; #user; #guest};
  public type AccessControlState = {var adminAssigned : Bool; var userRoles : Map.Map<Principal, UserRole>};
  public func initState() : AccessControlState {{var adminAssigned = false; var userRoles = Map.empty<Principal, UserRole>()}};
  public func hasPermission(state : AccessControlState, caller : Principal, role : UserRole) : Bool {true};
  public func isAdmin(state : AccessControlState, caller : Principal) : Bool {true};
  public func getUserRole(state : AccessControlState, caller : Principal) : UserRole {#admin};
};