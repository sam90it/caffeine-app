import Principal "mo:core/Principal";
import AccessControl "access-control";

module class MixinAuthorization(state : AccessControl.AccessControlState) {
  public func isAuthorized(caller : Principal) : Bool {
    AccessControl.hasPermission(state, caller, #user);
  };
};