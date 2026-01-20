import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  public type UserProfile = {
    name : Text;
    phone : Text;
    countryCode : Text;
    currencyPreference : Text;
  };

  public type PersonProfile = {
    id : Nat;
    name : Text;
    approvalStatus : Bool;
    messages : [Message];
  };

  public type Message = {
    id : Nat;
    content : Text;
    // Add other legacy message fields here if needed
  };
};