import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

persistent actor {
  public type PersonId = Int;
  public type TransactionId = Int;
  public type Amount = Int;
  public type Timestamp = Int;

  public type TransactionType = { #debit; #credit; };
  public type LedgerStatus = { #pending; #approved; #rejected; #archived; };

  public type LedgerEntry = {
    id : TransactionId;
    amount : Amount;
    date : Timestamp;
    transactionType : TransactionType;
    description : Text;
    currency : Text;
    status : LedgerStatus;
    counterparty : Principal;
    counterpartId : ?TransactionId;
  };

  public type PersonProfile = {
    id : PersonId;
    name : Text;
    approvalStatus : Bool;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    countryCode : Text;
    currencyPreference : Text;
  };

  public type BalanceSummary = {
    totalLent : Amount;
    totalRepaid : Amount;
    totalOwed : Amount;
    remainingDue : Amount;
  };

  // --- State Variables ---
  transient var nextId : Int = 0;
  
  transient let userProfiles = HashMap.HashMap<Principal, UserProfile>(0 : Nat, Principal.equal, Principal.hash);
  transient let personProfiles = HashMap.HashMap<Principal, HashMap.HashMap<Int, PersonProfile>>(0 : Nat, Principal.equal, Principal.hash);
  transient let userLedgers = HashMap.HashMap<Principal, HashMap.HashMap<Int, [LedgerEntry]>>(0 : Nat, Principal.equal, Principal.hash);

  // --- Helper Functions ---
  func getPersonProfiles(user : Principal) : HashMap.HashMap<Int, PersonProfile> {
    switch (personProfiles.get(user)) {
      case (null) { 
        let m = HashMap.HashMap<Int, PersonProfile>(0 : Nat, Int.equal, Int.hash); 
        personProfiles.put(user, m); 
        m 
      };
      case (?p) { p };
    }
  };

  func getUserLedger(user : Principal) : HashMap.HashMap<Int, [LedgerEntry]> {
    switch (userLedgers.get(user)) {
      case (null) { 
        let m = HashMap.HashMap<Int, [LedgerEntry]>(0 : Nat, Int.equal, Int.hash); 
        userLedgers.put(user, m); 
        m 
      };
      case (?l) { l };
    }
  };

  // --- Public Methods ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.put(caller, profile);
  };

  public shared ({ caller }) func createPersonProfile(name : Text) : async Int {
    let id = nextId;
    nextId += 1;
    let profile : PersonProfile = { id; name; approvalStatus = false; };
    getPersonProfiles(caller).put(id, profile);
    id;
  };

  public shared ({ caller }) func addLedgerEntry(personId : Int, amount : Amount, txType : TransactionType, desc : Text, date : Timestamp, curr : Text, counterparty : Principal) : async (Int, ?Int) {
    let id = nextId;
    nextId += 1;
    let entry : LedgerEntry = { id; amount; date; transactionType = txType; description = desc; currency = curr; status = #approved; counterparty; counterpartId = null };
    let ledger = getUserLedger(caller);
    let entries = switch (ledger.get(personId)) { case(null) []; case(?e) e };
    ledger.put(personId, Array.append<LedgerEntry>(entries, [entry]));
    (id, null);
  };

  public query ({ caller }) func getSummaryDashboard() : async BalanceSummary {
    var lent : Int = 0;
    var repaid : Int = 0;
    let ledgerMap = getUserLedger(caller);
    for (entries in ledgerMap.vals()) {
      for (entry in entries.values()) {
        switch (entry.transactionType) {
          case (#debit) { lent += entry.amount };
          case (#credit) { repaid += entry.amount };
        };
      };
    };
    { totalLent = lent; totalRepaid = repaid; totalOwed = 0; remainingDue = lent - repaid };
  };

  public query ({ caller }) func getAllPeople() : async [PersonProfile] {
    Iter.toArray<PersonProfile>(getPersonProfiles(caller).vals());
  };

  public query ({ caller }) func getTransactionHistory(personId : Int) : async [LedgerEntry] {
    switch (getUserLedger(caller).get(personId)) { case(null) []; case(?e) e };
  };
};
