import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  type PersonId = Nat;
  type TransactionId = Nat;
  type Amount = Int;
  type Timestamp = Int;
  type GroupId = Nat;
  type MemberId = Nat;
  type ExpenseId = Nat;

  public type TransactionType = {
    #debit;
    #credit;
  };

  public type LedgerStatus = {
    #pending;
    #approved;
    #rejected;
    #archived;
  };

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

  module LedgerEntry {
    public func compare(entry1 : LedgerEntry, entry2 : LedgerEntry) : Order.Order {
      Int.compare(entry1.date, entry2.date);
    };
  };

  public type PersonProfile = {
    id : PersonId;
    name : Text;
    approvalStatus : Bool;
    messages : [Message];
  };

  module PersonProfile {
    public func compare(profile1 : PersonProfile, profile2 : PersonProfile) : Order.Order {
      Nat.compare(profile1.id, profile2.id);
    };
  };

  public type Message = {
    id : Nat;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Timestamp;
    status : MessageStatus;
    transactionIds : [TransactionId];
  };

  public type MessageStatus = {
    #sent;
    #received;
    #seen;
  };

  public type CurrencyCode = Text;
  public type UserProfile = {
    name : Text;
    phone : Text;
    countryCode : Text;
    currencyPreference : CurrencyCode;
  };
  public type BalanceSummary = {
    totalLent : Amount;
    totalRepaid : Amount;
    totalOwed : Amount;
    remainingDue : Amount;
  };

  // Group Travel Types
  public type GroupMember = {
    id : MemberId;
    name : Text;
    contact : Text;
    profilePhoto : ?Storage.ExternalBlob;
  };

  public type Expense = {
    id : ExpenseId;
    memberId : MemberId;
    amount : Amount;
    description : Text;
    date : Timestamp;
    currency : CurrencyCode;
  };

  public type Settlement = {
    fromMemberId : MemberId;
    toMemberId : MemberId;
    amount : Amount;
  };

  public type TravelGroup = {
    id : GroupId;
    name : Text;
    createdAt : Timestamp;
    members : [GroupMember];
    expenses : [Expense];
    settlements : [Settlement];
    isCalculated : Bool;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let personProfiles = Map.empty<Principal, Map.Map<Nat, PersonProfile>>();
  let userLedgers = Map.empty<Principal, Map.Map<Nat, [LedgerEntry]>>();
  let userNextTransactionId = Map.empty<Principal, Nat>();
  let userNextPersonId = Map.empty<Principal, Nat>();
  let userNextMessageId = Map.empty<Principal, Nat>();

  // Group Travel State
  let userTravelGroups = Map.empty<Principal, Map.Map<GroupId, TravelGroup>>();
  let userNextGroupId = Map.empty<Principal, Nat>();
  let userNextMemberId = Map.empty<Principal, Nat>();
  let userNextExpenseId = Map.empty<Principal, Nat>();

  func getPersonProfiles(user : Principal) : Map.Map<Nat, PersonProfile> {
    switch (personProfiles.get(user)) {
      case (null) {
        let newMap = Map.empty<Nat, PersonProfile>();
        personProfiles.add(user, newMap);
        newMap;
      };
      case (?profiles) { profiles };
    };
  };

  func getUserLedger(user : Principal) : Map.Map<Nat, [LedgerEntry]> {
    switch (userLedgers.get(user)) {
      case (null) {
        let newMap = Map.empty<Nat, [LedgerEntry]>();
        userLedgers.add(user, newMap);
        newMap;
      };
      case (?ledger) { ledger };
    };
  };

  func getTravelGroups(user : Principal) : Map.Map<GroupId, TravelGroup> {
    switch (userTravelGroups.get(user)) {
      case (null) {
        let newMap = Map.empty<GroupId, TravelGroup>();
        userTravelGroups.add(user, newMap);
        newMap;
      };
      case (?groups) { groups };
    };
  };

  func getNextPersonId(user : Principal) : Nat {
    switch (userNextPersonId.get(user)) {
      case (null) { 0 };
      case (?id) { id };
    };
  };

  func incrementPersonId(user : Principal) : () {
    let current = getNextPersonId(user);
    userNextPersonId.add(user, current + 1);
  };

  func getNextTransactionId(user : Principal) : Nat {
    switch (userNextTransactionId.get(user)) {
      case (null) { 0 };
      case (?id) { id };
    };
  };

  func incrementTransactionId(user : Principal) : () {
    let current = getNextTransactionId(user);
    userNextTransactionId.add(user, current + 1);
  };

  func getNextMessageId(user : Principal) : Nat {
    switch (userNextMessageId.get(user)) {
      case (null) { 0 };
      case (?id) { id };
    };
  };

  func incrementMessageId(user : Principal) : () {
    let current = getNextMessageId(user);
    userNextMessageId.add(user, current + 1);
  };

  func getNextGroupId(user : Principal) : Nat {
    switch (userNextGroupId.get(user)) {
      case (null) { 0 };
      case (?id) { id };
    };
  };

  func incrementGroupId(user : Principal) : () {
    let current = getNextGroupId(user);
    userNextGroupId.add(user, current + 1);
  };

  func getNextMemberId(user : Principal) : Nat {
    switch (userNextMemberId.get(user)) {
      case (null) { 0 };
      case (?id) { id };
    };
  };

  func incrementMemberId(user : Principal) : () {
    let current = getNextMemberId(user);
    userNextMemberId.add(user, current + 1);
  };

  func getNextExpenseId(user : Principal) : Nat {
    switch (userNextExpenseId.get(user)) {
      case (null) { 0 };
      case (?id) { id };
    };
  };

  func incrementExpenseId(user : Principal) : () {
    let current = getNextExpenseId(user);
    userNextExpenseId.add(user, current + 1);
  };

  func verifyPersonOwnership(caller : Principal, personId : Nat) : Bool {
    let profiles = getPersonProfiles(caller);
    profiles.containsKey(personId);
  };

  func verifyGroupOwnership(caller : Principal, groupId : GroupId) : Bool {
    let groups = getTravelGroups(caller);
    groups.containsKey(groupId);
  };

  func isRegisteredUser(principal : Principal) : Bool {
    userProfiles.containsKey(principal);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles := Map.put(userProfiles, Principal.compare, caller, profile).0;
  };

  public shared ({ caller }) func createPersonProfile(name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create person profiles");
    };

    if (name == "") { Runtime.trap("Name cannot be empty") };

    let profiles = getPersonProfiles(caller);
    let id = getNextPersonId(caller);

    let profile : PersonProfile = {
      id;
      name;
      approvalStatus = false;
      messages = [];
    };
    profiles.add(id, profile);
    incrementPersonId(caller);

    let ledgers = getUserLedger(caller);
    profiles := Map.put(profiles, Nat.compareprofiles := Map.remove(ledgers := Map.put(ledgers, Nat.compare, id, []).0;profiles, Nat.compare, id).0;, id, updatedProfile).0;

    id;
  };

  public shared ({ caller }) func editPersonProfile(id : Nat, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit person profiles");
    };

    if (newName == "") { Runtime.trap("Name cannot be empty") };

    if (not verifyPersonOwnership(caller, id)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let profiles = getPersonProfiles(caller);

    switch (profiles.get(id)) {
      case (null) { Runtime.trap("Person profile does not exist") };
      case (?profile) {
        let updatedProfile : PersonProfile = {
          id = profile.id;
          name = newName;
          approvalStatus = profile.approvalStatus;
          messages = profile.messages;
        };
        profiles := Map.put(profiles, Nat.compare, id, updatedProfile).0;
      };
    };
  };

  public shared ({ caller }) func deletePersonProfile(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete person profiles");
    };

    if (not verifyPersonOwnership(caller, id)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let profiles = getPersonProfiles(caller);
    if (not profiles.containsKey(id)) { Runtime.trap("Person profile does not exist") };
    profiles := Map.put(profiles, Nat.compareprofiles := Map.remove(profiles, Nat.compare, id).0;, id, updatedProfile).0;

    let ledgers = getUserLedger(caller);
    ledgers.remove(id);
  };

  public shared ({ caller }) func addLedgerEntry(
    personId : Nat,
    amount : Amount,
    transactionType : TransactionType,
    description : Text,
    date : Timestamp,
    currency : CurrencyCode,
    counterparty : Principal,
  ) : async (TransactionId, ?TransactionId) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let isSingleUserTransaction = (
      counterparty == Principal.fromText("aaaaa-aa") or counterparty == Principal.fromText("2vxsx-fae") or counterparty.toText() == ""
    );

    if (not isSingleUserTransaction) {
      if (not isRegisteredUser(counterparty)) {
        Runtime.trap("Unauthorized: Counterparty is not a registered user");
      };

      if (counterparty == caller) {
        Runtime.trap("Invalid: Cannot create transaction with yourself");
      };
    };

    let newTransactionId = getNextTransactionId(caller);

    switch (Map.get(getPersonProfiles(caller), Nat.compare, personId)) {
      case (null) { Runtime.trap("Person profile does not exist") };
      case (_) {
        let effectiveCounterparty = if (isSingleUserTransaction) { caller } else { counterparty };
        let entryStatus = if (isSingleUserTransaction) { #approved } else { #pending };

        let ledgerEntry : LedgerEntry = {
          id = newTransactionId;
          amount;
          date;
          transactionType;
          description;
          currency;
          status = entryStatus;
          counterparty = effectiveCounterparty;
          counterpartId = null;
        };

        let callerLedgers = getUserLedger(caller);
        let personLedger = switch (callerLedgers.get(personId)) {
          case (null) { [ledgerEntry] };
          case (?entries) { entries.concat([ledgerEntry]) };
        };
        callerLedgers.add(personId, personLedger);

        incrementTransactionId(caller);

        if (isSingleUserTransaction) {
          return (newTransactionId, null);
        };

        let counterpartyTransactionId = getNextTransactionId(counterparty);

        let counterpartyLedgerEntry : LedgerEntry = {
          id = counterpartyTransactionId;
          amount;
          date;
          transactionType = switch (transactionType) {
            case (#debit) { #credit };
            case (#credit) { #debit };
          };
          description;
          currency;
          status = #pending;
          counterparty = caller;
          counterpartId = ?newTransactionId;
        };

        let updatedCallerEntry : LedgerEntry = {
          id = newTransactionId;
          amount;
          date;
          transactionType;
          description;
          currency;
          status = #pending;
          counterparty;
          counterpartId = ?counterpartyTransactionId;
        };

        let updatedPersonLedger = switch (callerLedgers.get(personId)) {
          case (null) { [updatedCallerEntry] };
          case (?entries) {
            let filtered = entries.filter(func(e : LedgerEntry) : Bool { e.id != newTransactionId });
            filtered.concat([updatedCallerEntry]);
          };
        };
        callerLedgers.add(personId, updatedPersonLedger);

        incrementTransactionId(counterparty);

        (newTransactionId, ?counterpartyTransactionId);
      };
    };
  };

  public shared ({ caller }) func setApprovalStatus(personId : Nat, approved : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set approval status");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let profiles = getPersonProfiles(caller);
    switch (profiles.get(personId)) {
      case (null) { Runtime.trap("Person profile does not exist") };
      case (?profile) {
        let updatedProfile : PersonProfile = {
          id = profile.id;
          name = profile.name;
          approvalStatus = approved;
          messages = profile.messages;
        };
        profiles.add(personId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func approveLedgerEntry(personId : Nat, transactionId : TransactionId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can approve transactions");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    await updateLedgerStatusInternal(caller, personId, transactionId, #approved);
  };

  public shared ({ caller }) func rejectLedgerEntry(personId : Nat, transactionId : TransactionId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reject transactions");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    await updateLedgerStatusInternal(caller, personId, transactionId, #rejected);
  };

  func updateLedgerStatusInternal(
    caller : Principal,
    personId : Nat,
    transactionId : TransactionId,
    status : LedgerStatus,
  ) : async () {
    let ledgers = getUserLedger(caller);
    switch (ledgers.get(personId)) {
      case (null) { Runtime.trap("Person ledger does not exist") };
      case (?entries) {
        let updatedEntries = entries.map(
          func(e) {
            if (e.id == transactionId) {
              {
                id = transactionId;
                amount = e.amount;
                transactionType = e.transactionType;
                description = e.description;
                date = e.date;
                currency = e.currency;
                status;
                counterparty = e.counterparty;
                counterpartId = e.counterpartId;
              };
            } else { e };
          }
        );
        ledgers.add(personId, updatedEntries);
      };
    };
  };

  func calculateTotals(ledgers : Map.Map<Nat, [LedgerEntry]>) : {
    totalLent : Amount;
    totalRepaid : Amount;
    totalOwed : Amount;
    remainingDue : Amount;
    approvedProfilesCount : Nat;
  } {
    var totalLent : Amount = 0;
    var totalRepaid : Amount = 0;
    var totalOwed : Amount = 0;
    var approvedCount : Nat = 0;

    for (entries in ledgers.values()) {
      for (entry in entries.values()) {
        switch (entry.status) {
          case (#approved) {
            switch (entry.transactionType) {
              case (#debit) { totalLent += entry.amount };
              case (#credit) { totalRepaid += entry.amount };
            };
          };
          case (#pending) {};
          case (#rejected) {};
          case (#archived) {};
        };
      };
    };

    {
      totalLent;
      totalRepaid;
      totalOwed;
      remainingDue = totalLent - totalRepaid;
      approvedProfilesCount = approvedCount;
    };
  };

  public query ({ caller }) func getSummaryDashboard() : async BalanceSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };
    let ledgers = getUserLedger(caller);
    let totals = calculateTotals(ledgers);
    {
      totalLent = totals.totalLent;
      totalRepaid = totals.totalRepaid;
      totalOwed = totals.totalOwed;
      remainingDue = totals.remainingDue;
    };
  };

  public query ({ caller }) func getProfileBalance(personId : Nat) : async BalanceSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balances");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let ledgers = getUserLedger(caller);
    switch (ledgers.get(personId)) {
      case (null) { Runtime.trap("Person ledger does not exist") };
      case (?entries) {
        var totalLent : Amount = 0;
        var totalRepaid : Amount = 0;
        var totalOwed : Amount = 0;

        for (entry in entries.values()) {
          switch (entry.status) {
            case (#approved) {
              switch (entry.transactionType) {
                case (#debit) { totalLent += entry.amount };
                case (#credit) { totalRepaid += entry.amount };
              };
            };
            case (#pending) {};
            case (#rejected) {};
            case (#archived) {};
          };
        };

        {
          totalLent;
          totalRepaid;
          totalOwed;
          remainingDue = totalLent - totalRepaid;
        };
      };
    };
  };

  public query ({ caller }) func getAllLedgerEntries(personId : Nat) : async [LedgerEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let ledgers = getUserLedger(caller);
    switch (ledgers.get(personId)) {
      case (null) { Runtime.trap("Person ledger does not exist") };
      case (?entries) {
        entries.filter<LedgerEntry>(func(e) { e.status == #approved });
      };
    };
  };

  public query ({ caller }) func getTransactionHistory(personId : Nat) : async [LedgerEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let ledgers = getUserLedger(caller);
    switch (ledgers.get(personId)) {
      case (null) { Runtime.trap("Person ledger does not exist") };
      case (?entries) { entries };
    };
  };

  public shared ({ caller }) func markTransactionAsRepaid(personId : Nat, transactionId : TransactionId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark transactions as repaid");
    };

    if (not verifyPersonOwnership(caller, personId)) {
      Runtime.trap("Unauthorized: Person profile does not belong to caller");
    };

    let ledgers = getUserLedger(caller);
    switch (ledgers.get(personId)) {
      case (null) { Runtime.trap("Person ledger does not exist") };
      case (?entries) {
        var entryFound = false;
        for (entry in entries.values()) {
          if (entry.id == transactionId) { entryFound := true };
        };

        if (not entryFound) { Runtime.trap("Ledger entry does not exist") };

        let updatedEntries = entries.map(
          func(entry) {
            if (entry.id == transactionId) {
              {
                id = transactionId;
                amount = entry.amount;
                transactionType = #credit;
                description = entry.description;
                date = entry.date;
                currency = entry.currency;
                status = #archived;
                counterparty = entry.counterparty;
                counterpartId = entry.counterpartId;
              };
            } else { entry };
          }
        );
        ledgers.add(personId, updatedEntries);
      };
    };
  };

  // Transform function for HTTP outcalls - no authentication required (system callback)
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Country codes accessible to guests for login/registration - no authentication required
  public shared ({ caller }) func getCountryCodes() : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #guest)) {
      Runtime.trap("Unauthorized: Guests only (for login/registration)");
    };
    await OutCall.httpGetRequest(
      "https://raw.githubusercontent.com/andreasmaunz/e2e-dapps/ic-migration/system_prompt/Productivity/Countries.json",
      [],
      transform,
    );
  };

  public shared ({ caller }) func resetDashboard() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset dashboard");
    };

    personProfiles.remove(caller);
    userLedgers.remove(caller);

    userNextTransactionId.add(caller, 0);
    userNextPersonId.add(caller, 0);
    userNextMessageId.add(caller, 0);
  };

  // ========== GROUP TRAVEL FUNCTIONS ==========

  public shared ({ caller }) func createTravelGroup(name : Text) : async GroupId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create travel groups");
    };

    if (name == "") { Runtime.trap("Group name cannot be empty") };

    let groups = getTravelGroups(caller);
    let groupId = getNextGroupId(caller);

    let newGroup : TravelGroup = {
      id = groupId;
      name;
      createdAt = Time.now();
      members = [];
      expenses = [];
      settlements = [];
      isCalculated = false;
    };

    profiles := Map.put(profiles, Nat.compareprofiles := Map.remove(ledgers := Map.put(ledgers, Nat.cgroups := Map.put(groups, Nat.compare, groupId, newGroup).0;ompare, id, []).0;profiles, Nat.compare, id).0;, id, updatedProfile).0;
    incrementGroupId(caller);

    groupId;
  };

  public query ({ caller }) func getAllTravelGroups() : async [TravelGroup] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view travel groups");
    };

    let groups = getTravelGroups(caller);
    groups.values().toArray();
  };

  public query ({ caller }) func getTravelGroup(groupId : GroupId) : async ?TravelGroup {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view travel groups");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    let groups = getTravelGroups(caller);
    groups.get(groupId);
  };

  public shared ({ caller }) func addGroupMember(
    groupId : GroupId,
    name : Text,
    contact : Text,
    profilePhoto : ?Storage.ExternalBlob,
  ) : async MemberId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add group members");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    if (name == "") { Runtime.trap("Member name cannot be empty") };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        let memberId = getNextMemberId(caller);

        let newMember : GroupMember = {
          id = memberId;
          name;
          contact;
          profilePhoto;
        };

        let updatedMembers = group.members.concat([newMember]);

        let updatedGroup : TravelGroup = {
          id = group.id;
          name = group.name;
          createdAt = group.createdAt;
          members = updatedMembers;
          expenses = group.expenses;
          settlements = group.settlements;
          isCalculated = false;
        };

        groups.add(groupId, updatedGroup);
        incrementMemberId(caller);

        memberId;
      };
    };
  };

  public shared ({ caller }) func removeGroupMember(groupId : GroupId, memberId : MemberId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove group members");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        // Verify member exists
        var memberExists = false;
        for (member in group.members.values()) {
          if (member.id == memberId) { memberExists := true };
        };

        if (not memberExists) {
          Runtime.trap("Member does not exist in this group");
        };

        let updatedMembers = group.members.filter(func(m) { m.id != memberId });

        let updatedGroup : TravelGroup = {
          id = group.id;
          name = group.name;
          createdAt = group.createdAt;
          members = updatedMembers;
          expenses = group.expenses;
          settlements = group.settlements;
          isCalculated = group.isCalculated;
        };

        groups.add(groupId, updatedGroup);
      };
    };
  };

  public shared ({ caller }) func addExpense(
    groupId : GroupId,
    memberId : MemberId,
    amount : Amount,
    description : Text,
    currency : CurrencyCode,
  ) : async ExpenseId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    if (amount <= 0) { Runtime.trap("Expense amount must be positive") };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        // Verify member exists
        var memberExists = false;
        for (member in group.members.values()) {
          if (member.id == memberId) { memberExists := true };
        };

        if (not memberExists) { Runtime.trap("Member does not exist in this group") };

        let expenseId = getNextExpenseId(caller);

        let newExpense : Expense = {
          id = expenseId;
          memberId;
          amount;
          description;
          date = Time.now();
          currency;
        };

        let updatedExpenses = group.expenses.concat([newExpense]);

        let updatedGroup : TravelGroup = {
          id = group.id;
          name = group.name;
          createdAt = group.createdAt;
          members = group.members;
          expenses = updatedExpenses;
          settlements = group.settlements;
          isCalculated = false;
        };

        groups.add(groupId, updatedGroup);
        incrementExpenseId(caller);

        expenseId;
      };
    };
  };

  public shared ({ caller }) func editExpense(
    groupId : GroupId,
    expenseId : ExpenseId,
    amount : Amount,
    description : Text,
    currency : CurrencyCode,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit expenses");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    if (amount <= 0) { Runtime.trap("Expense amount must be positive") };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        // Verify expense exists in this group
        let existingExpense = group.expenses.find(func(e) { e.id == expenseId });
        switch (existingExpense) {
          case (null) { Runtime.trap("Expense does not exist in this group") };
          case (?expense) {
            let updatedExpenses = group.expenses.map(
              func(e) {
                if (e.id == expenseId) {
                  {
                    id = e.id;
                    memberId = e.memberId;
                    amount;
                    description;
                    date = e.date;
                    currency;
                  };
                } else { e };
              }
            );

            let updatedGroup : TravelGroup = {
              id = group.id;
              name = group.name;
              createdAt = group.createdAt;
              members = group.members;
              expenses = updatedExpenses;
              settlements = group.settlements;
              isCalculated = group.isCalculated;
            };
            groups.add(groupId, updatedGroup);
          };
        };
      };
    };
  };

  public shared ({ caller }) func calculateGroupBalance(groupId : GroupId) : async [Settlement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate group balances");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        if (group.members.size() == 0) {
          Runtime.trap("Cannot calculate balance: No members in group");
        };

        // Calculate total expenses
        var totalExpenses : Amount = 0;
        for (expense in group.expenses.values()) {
          totalExpenses += expense.amount;
        };

        // Calculate equal share per member
        let equalShare = totalExpenses / group.members.size();

        // Calculate each member's balance (what they paid - what they should pay)
        var memberBalances = Map.empty<MemberId, Amount>();

        for (member in group.members.values()) {
          var memberPaid : Amount = 0;
          for (expense in group.expenses.values()) {
            if (expense.memberId == member.id) {
              memberPaid += expense.amount;
            };
          };

          let balance = memberPaid - equalShare;
          memberBalances.add(member.id, balance);
        };

        // Create settlements: positive balances receive, negative balances pay
        var settlements : [Settlement] = [];
        var creditors : [(MemberId, Amount)] = [];
        var debtors : [(MemberId, Amount)] = [];

        for ((memberId, balance) in memberBalances.entries()) {
          if (balance > 0) {
            creditors := creditors.concat([(memberId, balance)]);
          } else if (balance < 0) {
            debtors := debtors.concat([(memberId, -balance)]);
          };
        };

        // Match debtors with creditors
        var creditorIndex = 0;
        var debtorIndex = 0;
        var creditorRemaining = if (creditors.size() > 0) { creditors[0].1 } else { 0 };
        var debtorRemaining = if (debtors.size() > 0) { debtors[0].1 } else { 0 };

        while (creditorIndex < creditors.size() and debtorIndex < debtors.size()) {
          let creditorId = creditors[creditorIndex].0;
          let debtorId = debtors[debtorIndex].0;

          let settlementAmount = if (creditorRemaining < debtorRemaining) {
            creditorRemaining;
          } else {
            debtorRemaining;
          };

          if (settlementAmount > 0) {
            let settlement : Settlement = {
              fromMemberId = debtorId;
              toMemberId = creditorId;
              amount = settlementAmount;
            };
            settlements := settlements.concat([settlement]);
          };

          creditorRemaining -= settlementAmount;
          debtorRemaining -= settlementAmount;

          if (creditorRemaining == 0) {
            creditorIndex += 1;
            if (creditorIndex < creditors.size()) {
              creditorRemaining := creditors[creditorIndex].1;
            };
          };

          if (debtorRemaining == 0) {
            debtorIndex += 1;
            if (debtorIndex < debtors.size()) {
              debtorRemaining := debtors[debtorIndex].1;
            };
          };
        };

        // Update group with settlements
        let updatedGroup : TravelGroup = {
          id = group.id;
          name = group.name;
          createdAt = group.createdAt;
          members = group.members;
          expenses = group.expenses;
          settlements;
          isCalculated = true;
        };

        groups.add(groupId, updatedGroup);

        settlements;
      };
    };
  };

  public shared ({ caller }) func deleteTravelGroup(groupId : GroupId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete travel groups");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    let groups = getTravelGroups(caller);
    if (not groups.containsKey(groupId)) {
      Runtime.trap("Travel group does not exist");
    };

    groups.remove(groupId);
  };

  public shared ({ caller }) func updateTravelGroup(
    groupId : GroupId,
    name : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update travel groups");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    if (name == "") { Runtime.trap("Group name cannot be empty") };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        let updatedGroup : TravelGroup = {
          id = group.id;
          name;
          createdAt = group.createdAt;
          members = group.members;
          expenses = group.expenses;
          settlements = group.settlements;
          isCalculated = group.isCalculated;
        };

        groups.add(groupId, updatedGroup);
      };
    };
  };

  public shared ({ caller }) func updateGroupMember(
    groupId : GroupId,
    memberId : MemberId,
    name : Text,
    contact : Text,
    profilePhoto : ?Storage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update group members");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    if (name == "") { Runtime.trap("Member name cannot be empty") };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        // Verify member exists
        let existingMember = group.members.find(func(m) { m.id == memberId });
        switch (existingMember) {
          case (null) { Runtime.trap("Member does not exist in this group") };
          case (_) {
            let updatedMembers = group.members.map(
              func(m) {
                if (m.id == memberId) {
                  {
                    id = m.id;
                    name;
                    contact;
                    profilePhoto;
                  };
                } else { m };
              }
            );

            let updatedGroup : TravelGroup = {
              id = group.id;
              name = group.name;
              createdAt = group.createdAt;
              members = updatedMembers;
              expenses = group.expenses;
              settlements = group.settlements;
              isCalculated = group.isCalculated;
            };
            groups.add(groupId, updatedGroup);
          };
        };
      };
    };
  };

  public query ({ caller }) func getGroupMemberProfilePhoto(
    groupId : GroupId,
    memberId : MemberId,
  ) : async ?Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view member profile photos");
    };

    if (not verifyGroupOwnership(caller, groupId)) {
      Runtime.trap("Unauthorized: Travel group does not belong to caller");
    };

    let groups = getTravelGroups(caller);
    switch (groups.get(groupId)) {
      case (null) { Runtime.trap("Travel group does not exist") };
      case (?group) {
        let member = group.members.find(func(m) { m.id == memberId });
        switch (member) {
          case (null) { null };
          case (?m) { m.profilePhoto };
        };
      };
    };
  };

  // Currency list accessible to guests for registration - no authentication required
  public query func getAllCurrencies() : async [(Text, Text)] {
    [("INR", "₹"), ("EUR", "€"), ("USD", "$")];
  };

  // Get All People for "People" page
  public query ({ caller }) func getAllPeople() : async [PersonProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view people");
    };

    let profiles = getPersonProfiles(caller);
    let iter = profiles.values();
    let peopleList = iter.toArray();
    peopleList.sort();
  };
};

