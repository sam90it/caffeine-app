import Map "mo:core/Map";

import Text "mo:core/Text";

import Principal "mo:core/Principal";

import MigrationHelper "migrationHelper";

import Nat "mo:core/Nat";

import Int "mo:core/Int";

import Debug "mo:core/Debug";



module {

  type Actor = {

    userProfiles : Map.Map<Principal, MigrationHelper.UserProfile>;

    userNextTransactionId : Map.Map<Principal, Nat>;

    userNextPersonId : Map.Map<Principal, Nat>;

    userNextMessageId : Map.Map<Principal, Nat>;

    personProfiles : Map.Map<Principal, Map.Map<Nat, PersonProfile>>;

    userLedgers : Map.Map<Principal, Map.Map<Nat, [LedgerEntry]>>;

  };



  public type PersonId = Nat;

  public type TransactionId = Nat;

  public type Amount = Int.Int;

  public type Timestamp = Int.Int;



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



  public type PersonProfile = {

    id : PersonId;

    name : Text;

    approvalStatus : Bool;

    messages : [Message];

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



  func getPersonProfiles(user : Principal, personProfiles : Map.Map<Principal, Map.Map<Nat, PersonProfile>>) : Map.Map<Nat, PersonProfile> {

    switch (personProfiles.get(user)) {

      case (null) {

        let newMap = Map.empty<Nat, PersonProfile>();

        personProfiles.add(user, newMap);

        newMap;

      };

      case (?profiles) { profiles };

    };

  };



  public func run(old : Actor) : Actor {

    Debug.print("Running migration");

    var migratedUserCount = 0;

    var migratedProfileCount = 0;

    var migratedLedgerCount = 0;



    let newPersonProfiles = Map.empty<Principal, Map.Map<Nat, PersonProfile>>();

    let newUserLedgers = Map.empty<Principal, Map.Map<Nat, [LedgerEntry]>>();



    let principalIter = old.userProfiles.keys();

    principalIter.forEach(

      func(principal) {

        let legacyProfiles = Map.empty<Nat, MigrationHelper.PersonProfile>();

        let newProfiles = legacyProfiles.map<Nat, MigrationHelper.PersonProfile, PersonProfile>(

          func(_legacyId, legacyProfile) {

            migratedProfileCount += 1;

            {

              id = legacyProfile.id;

              name = legacyProfile.name;

              approvalStatus = legacyProfile.approvalStatus;

              messages = legacyProfile.messages;

            };

          }

        );



        newPersonProfiles.add(principal, newProfiles);

      }

    );



    migratedUserCount := newPersonProfiles.size();



    let profileIter = newPersonProfiles.keys();

    profileIter.forEach(

      func(principal) {

        let profiles = getPersonProfiles(principal, newPersonProfiles);

        let ledger = Map.empty<Nat, [LedgerEntry]>();



        let profileValues = profiles.values().toArray();

        profileValues.forEach(

          func(profile) {

            let newEntries : [LedgerEntry] = [];

            ledger.add(profile.id, newEntries);

          }

        );



        newUserLedgers.add(principal, ledger);

      }

    );



    migratedLedgerCount := newUserLedgers.size();



    Debug.print("Migrated " # migratedUserCount.toText() # " users");

    Debug.print("Migrated " # migratedProfileCount.toText() # " profiles");

    Debug.print("Migrated " # migratedLedgerCount.toText() # " ledgers");



    {

      old with

      personProfiles = newPersonProfiles;

      userLedgers = newUserLedgers;

    };

  };

};