import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Amount = bigint;
export interface BalanceSummary {
  'totalLent' : Amount,
  'totalOwed' : Amount,
  'totalRepaid' : Amount,
  'remainingDue' : Amount,
}
export interface LedgerEntry {
  'id' : TransactionId,
  'status' : LedgerStatus,
  'transactionType' : TransactionType,
  'date' : Timestamp,
  'description' : string,
  'counterparty' : Principal,
  'counterpartId' : [] | [TransactionId],
  'currency' : string,
  'amount' : Amount,
}
export type LedgerStatus = { 'pending' : null } |
  { 'approved' : null } |
  { 'rejected' : null } |
  { 'archived' : null };
export type PersonId = bigint;
export interface PersonProfile {
  'id' : PersonId,
  'name' : string,
  'approvalStatus' : boolean,
}
export type Timestamp = bigint;
export type TransactionId = bigint;
export type TransactionType = { 'credit' : null } |
  { 'debit' : null };
export interface UserProfile {
  'name' : string,
  'countryCode' : string,
  'currencyPreference' : string,
  'phone' : string,
}
export interface _SERVICE {
  'addLedgerEntry' : ActorMethod<
    [bigint, Amount, TransactionType, string, Timestamp, string, Principal],
    [bigint, [] | [bigint]]
  >,
  'createPersonProfile' : ActorMethod<[string], bigint>,
  'getAllPeople' : ActorMethod<[], Array<PersonProfile>>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getSummaryDashboard' : ActorMethod<[], BalanceSummary>,
  'getTransactionHistory' : ActorMethod<[bigint], Array<LedgerEntry>>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
